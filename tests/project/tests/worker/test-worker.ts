import { GDictionary, Node, Resource, ResourceLoader, Vector2 } from 'godot';
import { JSWorker } from 'godot.worker';
import {
	buildGodotTransferList,
	CyclicArray,
	CyclicNode,
	DeepMixedGraph,
	DictionaryMessage,
	DictionaryPayload,
	FullPayload,
	FullPayloadMessage,
	Message,
	MessageType,
	PlainMessage,
	TransferType,
} from './messaging';
import { beginAsyncTest, endAsyncTest, reportTestFailure } from '../test-status';
import TransferScriptedNode from './transfer-scripted-node';

// JSC cold-start worker boot and first round-trip can
const WORKER_READY_TIMEOUT_MS = 5000;
const WORKER_ROUND_TRIP_TIMEOUT_MS = 5000;

function fail(message: string): never {
	throw new Error(`worker-test: ${message}`);
}

function describeValueShape(value: unknown): string {
	const valueRecord = value as Record<string, unknown> | null;
	const constructorName =
		typeof valueRecord === 'object' && valueRecord !== null && typeof valueRecord.constructor === 'function'
			? valueRecord.constructor.name
			: typeof valueRecord === 'object' && valueRecord !== null && 'constructor' in valueRecord
				? String(valueRecord.constructor)
				: 'none';
	const tag = Object.prototype.toString.call(value);
	const keys = typeof valueRecord === 'object' && valueRecord !== null ? Object.keys(valueRecord).join(',') : '';
	return `type=${typeof value} ctor=${constructorName} tag=${tag} keys=[${keys}]`;
}

function assertVector2(value: unknown, expectedX: number, expectedY: number, label: string): asserts value is Vector2 {
	if (!(value instanceof Vector2)) {
		fail(`${label} was not a Vector2`);
	}
	if (value.x !== expectedX || value.y !== expectedY) {
		fail(`${label} mismatch (${value.x}, ${value.y}) !== (${expectedX}, ${expectedY})`);
	}
}

function assertResource(value: unknown, label: string): asserts value is Resource {
	if (value === null || value === undefined || typeof value !== 'object') {
		fail(`${label} was not a Godot object`);
	}
	const maybeGetClass = (value as { get_class?: unknown }).get_class;
	if (typeof maybeGetClass !== 'function') {
		fail(`${label} did not expose get_class()`);
	}
}

function assertDictionary(value: unknown, label: string): asserts value is GDictionary {
	if (value === null || value === undefined || typeof value !== 'object') {
		fail(`${label} was not a dictionary object`);
	}
	const maybeGetKeyed = (value as { get_keyed?: unknown }).get_keyed;
	if (typeof maybeGetKeyed !== 'function') {
		fail(`${label} did not expose get_keyed()`);
	}
}

function assertTypedArrayEquals(value: unknown, expected: readonly number[], label: string): asserts value is Uint16Array {
	if (!(value instanceof Uint16Array)) {
		fail(`${label} was not a Uint16Array`);
	}
	if (value.length !== expected.length) {
		fail(`${label} length mismatch (${value.length}) !== (${expected.length})`);
	}
	for (let i = 0; i < expected.length; i++) {
		if (value[i] !== expected[i]) {
			fail(`${label}[${String(i)}] mismatch (${value[i]}) !== (${expected[i]})`);
		}
	}
}

function assertDeepMixedGraphResponse(graph: DeepMixedGraph): void {
	assertVector2(graph.objectWithVariantAndCollections.marker, 77, 88, 'deepMixedGraph.objectWithVariantAndCollections.marker');
	assertTypedArrayEquals(graph.objectWithVariantAndCollections.typed, [100, 2, 3], 'deepMixedGraph.objectWithVariantAndCollections.typed');

	if (!(graph.objectWithVariantAndCollections.nestedSet instanceof Set)) {
		fail('deepMixedGraph.objectWithVariantAndCollections.nestedSet was not a Set');
	}
	if (!(graph.objectWithVariantAndCollections.nestedMap instanceof Map)) {
		fail('deepMixedGraph.objectWithVariantAndCollections.nestedMap was not a Map');
	}

	if (!(graph.setWithComplexValues instanceof Set)) {
		fail('deepMixedGraph.setWithComplexValues was not a Set');
	}
	if (!(graph.mapWithComplexValues instanceof Map)) {
		fail('deepMixedGraph.mapWithComplexValues was not a Map');
	}

	let hasExpectedDate = false;
	let hasExpectedRegExp = false;
	let hasCycleNode = false;
	for (const value of graph.objectWithVariantAndCollections.nestedSet) {
		if (value instanceof Date && value.toISOString() === '2024-05-06T07:08:09.000Z') {
			hasExpectedDate = true;
		}
		if (value instanceof RegExp && value.source === 'deep-worker' && value.flags === 'g') {
			hasExpectedRegExp = true;
		}
		if (typeof value === 'object' && value !== null && (value as { label?: unknown }).label === 'deep-root') {
			hasCycleNode = true;
		}
	}
	if (!hasExpectedDate) {
		fail('deepMixedGraph nested set missing expected Date');
	}
	if (!hasExpectedRegExp) {
		fail('deepMixedGraph nested set missing expected RegExp');
	}
	if (!hasCycleNode) {
		fail('deepMixedGraph nested set missing cycle node');
	}

	const deepCycleNode = graph.objectWithVariantAndCollections.nestedMap.get('cycleNode');
	if (typeof deepCycleNode !== 'object' || deepCycleNode === null) {
		fail('deepMixedGraph nested map cycleNode missing');
	}
	const cycleNodeSelf = (deepCycleNode as { self?: unknown }).self;
	if (cycleNodeSelf !== deepCycleNode) {
		fail('deepMixedGraph cycle node self reference mismatch');
	}

	const nestedTyped = graph.mapWithComplexValues.get('typed');
	assertTypedArrayEquals(nestedTyped, [200, 201], 'deepMixedGraph.mapWithComplexValues.typed');

	const nestedMirror = graph.mapWithComplexValues.get('mirror');
	if (!(nestedMirror instanceof Map)) {
		fail('deepMixedGraph.mapWithComplexValues.mirror was not a Map');
	}
	if (nestedMirror.get('set') !== graph.objectWithVariantAndCollections.nestedSet) {
		fail('deepMixedGraph mirror map set identity mismatch');
	}

	if (!graph.setWithComplexValues.has(graph.mapWithComplexValues)) {
		fail('deepMixedGraph.setWithComplexValues missing mapWithComplexValues');
	}
}

function assertFullPayloadResponse(payload: FullPayload, transferType: TransferType): void {
	assertVector2(payload.variantInJsObject.nested.marker, 3, 9, 'variantInJsObject.nested.marker');
	assertDeepMixedGraphResponse(payload.deepMixedGraph);

	const nestedJsResource = payload.transferredInJsObject.nested.resource;
	assertResource(nestedJsResource, 'transferredInJsObject.nested.resource');

	assertDictionary(payload.transferredInDictionary, 'transferredInDictionary');
	const nestedDictionary = payload.transferredInDictionary.get_keyed('nested');
	assertDictionary(nestedDictionary, 'transferredInDictionary.nested');
	const nestedDictionaryResource = nestedDictionary.get_keyed('resource');
	assertResource(nestedDictionaryResource, 'transferredInDictionary.nested.resource');
	const nestedDictionaryMarker = nestedDictionary.get_keyed('marker');
	assertVector2(nestedDictionaryMarker, 4, 6, 'transferredInDictionary.nested.marker');

	if (!(payload.map instanceof Map)) {
		fail('mapPayload was not a Map');
	}

	assertVector2(payload.map.get('vector'), 1, 2, 'mapPayload.vector');

	if (payload.map.get('number') !== 7) {
		fail('mapPayload.number mismatch');
	}

	assertVector2(payload.map.get('workerVector'), 8, 8, 'mapPayload.workerVector');

	if (!(payload.set instanceof Set)) {
		fail('setPayload was not a Set');
	}

	if (!payload.set.has('alpha')) {
		fail('setPayload did not contain alpha');
	}

	if (!payload.set.has('workerValue')) {
		fail('setPayload did not contain workerValue');
	}

	if (!(payload.transferBuffer instanceof ArrayBuffer)) {
		fail('transferBuffer was not an ArrayBuffer');
	}

	const bytes = new Uint8Array(payload.transferBuffer);

	if (bytes.length < 4) {
		fail('transferBuffer length was too small');
	}

	if (bytes[0] !== 99 || bytes[1] !== 22 || bytes[2] !== 33 || bytes[3] !== 44) {
		fail(`transferBuffer bytes mismatch: [${bytes.join(', ')}]`);
	}

	if (payload.bigIntValue !== BigInt('987654321012345678')) {
		fail(`bigIntValue mismatch: ${payload.bigIntValue.toString()}`);
	}

	if (!(payload.dateValue instanceof Date)) {
		fail('dateValue was not a Date');
	}

	if (payload.dateValue.toISOString() !== '2020-01-02T03:04:06.789Z') {
		fail(`dateValue mismatch: ${payload.dateValue.toISOString()}`);
	}

	if (!(payload.regExpValue instanceof RegExp)) {
		fail('regExpValue was not a RegExp');
	}

	if (payload.regExpValue.source !== 'worker-roundtrip-updated' || payload.regExpValue.flags !== 'gi') {
		fail(`regExpValue mismatch: /${payload.regExpValue.source}/${payload.regExpValue.flags}`);
	}

	assertTypedArrayEquals(payload.typedArrayValue, [42, 20, 30, 4000], 'typedArrayValue');

	const scriptedNode = payload.scriptedNodeWithExport;

	if (!(scriptedNode instanceof TransferScriptedNode)) {
		fail(`scriptedNodeWithExport was not a TransferScriptedNode (${describeValueShape(payload.scriptedNodeWithExport)})`);
	}

	if (scriptedNode.exportInt !== 456) {
		fail(`scriptedNodeWithExport.exportInt mismatch: ${String(scriptedNode.exportInt)}`);
	}

	if (scriptedNode.exportText !== 'worker-mutated') {
		fail(`scriptedNodeWithExport.exportText mismatch: ${String(scriptedNode.exportText)}`);
	}

	if (transferType === TransferType.Godot) {
		if (scriptedNode.get_child_count() < 1) {
			fail('scriptedNodeWithExport child was not accessible after transfer');
		}

		const roundTrippedChild = scriptedNode.get_child(0);
		if (!(roundTrippedChild instanceof Node)) {
			fail('scriptedNodeWithExport child was not a Node');
		}
		if (roundTrippedChild.get_name() !== 'implicit-child-worker') {
			fail(`scriptedNodeWithExport child name mismatch: ${roundTrippedChild.get_name()}`);
		}
	}

	const cycleNode = payload.cyclicNode;

	if (cycleNode.self !== cycleNode) {
		fail('cyclicNode.self identity mismatch');
	}

	if (cycleNode.child?.parent !== cycleNode) {
		fail('cyclicNode.child.parent identity mismatch');
	}

	if (cycleNode.workerTag !== 'seen-in-worker') {
		fail(`cyclicNode.workerTag mismatch: ${String(cycleNode.workerTag)}`);
	}

	const cycleArray = payload.cyclicArray;

	if (!Array.isArray(cycleArray)) {
		fail('cyclicArray was not an Array');
	}

	if (cycleArray[0] !== cycleNode) {
		fail('cyclicArray[0] did not reference cyclicNode');
	}

	if (cycleArray[1] !== cycleArray) {
		fail('cyclicArray self-reference mismatch');
	}

	if (cycleArray[2] !== 'worker-mark') {
		fail('cyclicArray worker marker missing');
	}
}

function assertDictionaryPayloadResponse(payload: DictionaryPayload) {
	assertDictionary(payload, 'roundTrippedPayload');

	const nestedDictionary = payload.get('nested');
	assertDictionary(nestedDictionary, 'roundTrippedPayload.nested');

	const nestedResource = nestedDictionary.get('resource');
	assertResource(nestedResource, 'roundTrippedPayload.nested.resource');

	const nestedMarker = nestedDictionary.get('marker');
	assertVector2(nestedMarker, 100, 200, 'roundTrippedPayload.nested.marker');
}

export default class TestWorker extends Node {
	private _worker: JSWorker | null = null;

	async _ready() {
		beginAsyncTest();

		try {
			for (let workerSession = 1; workerSession <= 3; workerSession++) {
				console.log(`[worker-test] session:${String(workerSession)}:start`);
				await this.runWorkerSession(workerSession);
				console.log(`[worker-test] session:${String(workerSession)}:done`);
			}
		} catch (error) {
			reportTestFailure('worker-main', error);
			throw error;
		} finally {
			endAsyncTest();
		}
	}

	private async runWorkerSession(workerSession: number): Promise<void> {
		const worker = new JSWorker('tests/worker/test.worker');
		this._worker = worker;
		try {
			console.log(`[worker-test] session:${String(workerSession)}:waitForWorkerReady:start`);
			await this.waitForWorkerReady(worker);
			console.log(`[worker-test] session:${String(workerSession)}:waitForWorkerReady:done`);
			console.log(`[worker-test] session:${String(workerSession)}:runFullRoundTrip:godot:start`);
			await this.runFullRoundTrip(worker, TransferType.Godot);
			console.log(`[worker-test] session:${String(workerSession)}:runFullRoundTrip:godot:done`);
			console.log(`[worker-test] session:${String(workerSession)}:runFullRoundTrip:javaScript:start`);
			await this.runFullRoundTrip(worker, TransferType.JavaScript);
			console.log(`[worker-test] session:${String(workerSession)}:runFullRoundTrip:javaScript:done`);
			console.log(`[worker-test] session:${String(workerSession)}:runDictionaryRoundTrip:start`);
			await this.runDictionaryRoundTrip(worker);
			console.log(`[worker-test] session:${String(workerSession)}:runDictionaryRoundTrip:done`);
			if (workerSession === 1) {
				console.log(`[worker-test] session:${String(workerSession)}:runPlainRoundTrip:start`);
				await this.runPlainRoundTrip(worker);
				console.log(`[worker-test] session:${String(workerSession)}:runPlainRoundTrip:done`);
			}
		} finally {
			worker.terminate();
			this._worker = null;
		}
	}

	private waitForWorkerReady(worker: JSWorker): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`worker ready timed out after ${String(WORKER_READY_TIMEOUT_MS)}ms`));
			}, WORKER_READY_TIMEOUT_MS);

			worker.onready = () => {
				clearTimeout(timeout);
				resolve();
			};
			worker.onerror = (error: unknown) => {
				clearTimeout(timeout);
				reject(error);
			};
		});
	}

	private runFullRoundTrip(worker: JSWorker, transferType: TransferType): Promise<void> {
		const nestedJsObjectResource = ResourceLoader.load('res://tests/resource/mage.tres');
		const nestedDictionaryResource = ResourceLoader.load('res://tests/resource/warrior.tres');

		if (nestedJsObjectResource === null || nestedDictionaryResource === null) {
			fail('required test resources failed to load');
		}

		const dictionary = GDictionary.create({
			nested: GDictionary.create({
				marker: new Vector2(4, 6),
				resource: nestedDictionaryResource,
			}),
		});
		const scriptedNodeWithExport = new TransferScriptedNode();
		scriptedNodeWithExport.exportInt = 123;
		scriptedNodeWithExport.exportText = 'main-initial';
		if (transferType === TransferType.Godot) {
			const scriptedNodeChild = new Node();
			scriptedNodeChild.set_name('implicit-child');
			scriptedNodeWithExport.add_child(scriptedNodeChild);
		}

		const transferBuffer = new Uint8Array([11, 22, 33, 44]).buffer;
		if (!(transferBuffer instanceof ArrayBuffer)) {
			fail(`sender transferBuffer was not an ArrayBuffer (${describeValueShape(transferBuffer)})`);
		}
		const cyclicNode: CyclicNode = { label: 'root' };
		const cyclicChild: NonNullable<CyclicNode['child']> = {};
		cyclicNode.self = cyclicNode;
		cyclicNode.child = cyclicChild;
		cyclicChild.parent = cyclicNode;
		const cyclicArray: CyclicArray = [cyclicNode];
		cyclicArray.push(cyclicArray);

		const deepCycleNode: Record<string, unknown> = { label: 'deep-root' };
		deepCycleNode.self = deepCycleNode;
		const deepNestedSet = new Set<unknown>([
			new Date('2024-01-01T00:00:00.000Z'),
			/deep-initial/gi,
			deepCycleNode,
		]);
		const deepNestedMap = new Map<string, unknown>([
			['marker', new Vector2(7, 11)],
			['typed', new Uint16Array([1, 2, 3])],
			['set', deepNestedSet],
			['cycleNode', deepCycleNode],
		]);
		const deepMixedGraph: DeepMixedGraph = {
			objectWithVariantAndCollections: {
				marker: new Vector2(70, 80),
				typed: new Uint16Array([1, 2, 3]),
				nestedSet: deepNestedSet,
				nestedMap: deepNestedMap,
			},
			setWithComplexValues: new Set<unknown>(),
			mapWithComplexValues: new Map<string, unknown>(),
		};
		deepMixedGraph.mapWithComplexValues.set('set', deepMixedGraph.objectWithVariantAndCollections.nestedSet);
		deepMixedGraph.mapWithComplexValues.set('typed', new Uint16Array([200, 201]));
		deepMixedGraph.mapWithComplexValues.set('mirror', new Map<string, unknown>([
			['set', deepMixedGraph.objectWithVariantAndCollections.nestedSet],
			['map', deepMixedGraph.objectWithVariantAndCollections.nestedMap],
		]));
		deepMixedGraph.setWithComplexValues.add(deepMixedGraph.mapWithComplexValues);
		deepMixedGraph.setWithComplexValues.add(deepMixedGraph.objectWithVariantAndCollections.nestedSet);
		deepMixedGraph.setWithComplexValues.add(deepCycleNode);

		const message: FullPayloadMessage = {
			type: MessageType.Full,
			payload: {
				variantInJsObject: {
					nested: {
						marker: new Vector2(3, 9),
					},
				},
				deepMixedGraph,
				transferredInJsObject: {
					nested: {
						resource: nestedJsObjectResource,
					},
				},
				transferredInDictionary: dictionary,
				map: new Map<string, unknown>([
					['number', 7],
					['vector', new Vector2(1, 2)],
				]),
				set: new Set<unknown>(['alpha', 12]),
				transferBuffer,
				bigIntValue: BigInt('900719925474099312345'),
				dateValue: new Date('2020-01-02T03:04:05.678Z'),
				regExpValue: /worker-roundtrip/gi,
				typedArrayValue: new Uint16Array([10, 20, 30, 4000]),
				scriptedNodeWithExport,
				cyclicNode,
				cyclicArray,
			},
			transferType,
		};

		return new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`worker round trip timed out after ${String(WORKER_ROUND_TRIP_TIMEOUT_MS)}ms (${transferType})`));
			}, WORKER_ROUND_TRIP_TIMEOUT_MS);

			worker.onmessage = (message: Message) => {
				try {
					if (!message || typeof message !== 'object' || message instanceof GDictionary) {
						fail('received malformed worker response');
					}

					if (message.type === MessageType.WorkerError) {
						fail(`worker reported error: ${message.message}`);
					}

						if (message.type !== MessageType.Full) {
							fail('unexpected message type');
						}

					assertFullPayloadResponse(message.payload, transferType);
					const roundTrippedScriptedNode = message.payload.scriptedNodeWithExport;
					if (roundTrippedScriptedNode instanceof Node) {
						roundTrippedScriptedNode.queue_free();
					}
					clearTimeout(timeout);
					resolve();
				} catch (error) {
					clearTimeout(timeout);
					reject(error);
				}
			};
			worker.onerror = (error: unknown) => {
				clearTimeout(timeout);
				reject(error);
			};

			if (!(message.payload.transferBuffer instanceof ArrayBuffer)) {
				fail(`dispatch transferBuffer was not an ArrayBuffer (${describeValueShape(message.payload.transferBuffer)})`);
			}

			const transfers = [nestedJsObjectResource, nestedDictionaryResource, dictionary, scriptedNodeWithExport];

			worker.postMessage(
				message,
				transferType === TransferType.Godot ? buildGodotTransferList(transfers) : transfers
			);
		});
	}

	private runDictionaryRoundTrip(worker: JSWorker): Promise<void> {
		const nestedResource = ResourceLoader.load('res://tests/resource/warrior.tres');
		if (nestedResource === null) {
			fail('dictionary test resource failed to load');
		}
		const message: DictionaryMessage = GDictionary.create({
			type: MessageType.Dictionary,
			payload: {
				nested: {
					marker: new Vector2(4, 6),
					resource: nestedResource,
				},
			},
		} as const);

		return new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`worker dictionary round trip timed out after ${String(WORKER_ROUND_TRIP_TIMEOUT_MS)}ms`));
			}, WORKER_ROUND_TRIP_TIMEOUT_MS);

			worker.onmessage = (message: Message) => {
				try {
					if (!message || typeof message !== 'object' || !(message instanceof GDictionary)) {
						if (message && typeof message === 'object' && !(message instanceof GDictionary) && message.type === MessageType.WorkerError) {
							fail(`worker reported error: ${message.message}`);
						}
						fail('received malformed worker response');
					}

					const messageType = message.get('type');

					if (messageType !== MessageType.Dictionary) {
						fail(`unexpected message type: ${messageType}`);
					}

					assertDictionaryPayloadResponse(message.get('payload'));
					clearTimeout(timeout);
					resolve();
				} catch (error) {
					clearTimeout(timeout);
					reject(error);
				}
			};
			worker.onerror = (error: unknown) => {
				clearTimeout(timeout);
				reject(error);
			};

			worker.postMessage(message, [nestedResource]);
		});
	}

	private runPlainRoundTrip(worker: JSWorker): Promise<void> {
		const message: PlainMessage = {
			type: MessageType.Plain,
			payload: {
				value: 41,
				text: 'plain',
			},
		};

		return new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`worker plain round trip timed out after ${String(WORKER_ROUND_TRIP_TIMEOUT_MS)}ms`));
			}, WORKER_ROUND_TRIP_TIMEOUT_MS);

			worker.onmessage = (rawMessage: Message) => {
				try {
					if (!rawMessage || typeof rawMessage !== 'object' || rawMessage instanceof GDictionary) {
						fail('received malformed plain worker response');
					}

					if (rawMessage.type === MessageType.WorkerError) {
						fail(`worker reported error: ${rawMessage.message}`);
					}

					if (rawMessage.type !== MessageType.Plain) {
						fail(`unexpected plain response type: ${rawMessage.type}`);
					}

					if (rawMessage.payload.value !== 42 || rawMessage.payload.text !== 'plain:worker') {
						fail(`plain response payload mismatch: ${JSON.stringify(rawMessage.payload)}`);
					}

					clearTimeout(timeout);
					resolve();
				} catch (error) {
					clearTimeout(timeout);
					reject(error);
				}
			};
			worker.onerror = (error: unknown) => {
				clearTimeout(timeout);
				reject(error);
			};

			worker.postMessage(message);
		});
	}
}
