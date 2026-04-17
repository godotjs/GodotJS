import { GDictionary, is_instance_valid, Node, Resource, Vector2 } from 'godot';
import { JSWorkerParent } from 'godot.worker';
import {
	buildGodotTransferList,
	DictionaryMessage,
	FullPayloadMessage,
	Message,
	MessageType,
	PlainMessage,
	TransferType,
} from './messaging';
import { TEST_FAILURE_SENTINEL_PREFIX } from '../test-status';
import TransferScriptedNode from './transfer-scripted-node';

function fail(failureMessage: string): never {
	const detailedMessage = `worker: ${failureMessage}`;
	console.error(`${TEST_FAILURE_SENTINEL_PREFIX} ${detailedMessage}`);
	throw new Error(detailedMessage);
}

function formatUnknownError(error: unknown): string {
	if (error instanceof Error) {
		return error.stack ?? error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
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
	if (!value || !(value instanceof Resource) || !is_instance_valid(value)) {
		fail(`${label} is not a valid Resource`);
	}
}

function assertDictionary(value: unknown, label: string): asserts value is GDictionary {
	if (!value || !(value instanceof GDictionary)) {
		fail(`${label} is not a valid Dictionary`);
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

function assertDeepMixedGraph(payload: FullPayloadMessage['payload']) {
	const graph = payload.deepMixedGraph;
	assertVector2(graph.objectWithVariantAndCollections.marker, 70, 80, 'deepMixedGraph.objectWithVariantAndCollections.marker');
	assertTypedArrayEquals(graph.objectWithVariantAndCollections.typed, [1, 2, 3], 'deepMixedGraph.objectWithVariantAndCollections.typed');

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

	const deepCycleNode = graph.objectWithVariantAndCollections.nestedMap.get('cycleNode');
	if (typeof deepCycleNode !== 'object' || deepCycleNode === null) {
		fail('deepMixedGraph nestedMap.cycleNode missing');
	}
	if ((deepCycleNode as { self?: unknown }).self !== deepCycleNode) {
		fail('deepMixedGraph cycleNode self-reference mismatch');
	}
	if (graph.objectWithVariantAndCollections.nestedMap.get('set') !== graph.objectWithVariantAndCollections.nestedSet) {
		fail('deepMixedGraph nestedMap set identity mismatch');
	}
}

if (JSWorkerParent) {
	JSWorkerParent.onmessage = (rawMessage: Message) => {
		try {
			if (!rawMessage || typeof rawMessage !== 'object') {
				fail('received malformed worker request');
			}

			const message = rawMessage instanceof GDictionary ? rawMessage.proxy() : rawMessage;

			if (!Object.values(MessageType).includes(message.type)) {
				fail(`unexpected message type: ${message.type}`);
			}

			switch (message.type) {
				case MessageType.Dictionary: {
					assertDictionary(rawMessage, 'received dictionary message');

					const clonedGodotPayload = (rawMessage as DictionaryMessage).get('payload');

					assertDictionary(clonedGodotPayload, 'clonedGodotPayload');

					const nestedDictionary = clonedGodotPayload.get('nested');
					assertDictionary(nestedDictionary, 'clonedGodotPayload.nested');

					const nestedResource = nestedDictionary.get('resource');
					assertResource(nestedResource, 'clonedGodotPayload.nested.resource');

					const nestedMarker = nestedDictionary.get('marker');
					assertVector2(nestedMarker, 4, 6, 'clonedGodotPayload.nested.marker');
					nestedDictionary.set('marker', new Vector2(100, 200));

					const response: DictionaryMessage = GDictionary.create({
						type: MessageType.Dictionary,
						payload: clonedGodotPayload,
					} as const);

					JSWorkerParent!.postMessage(response, [nestedResource]);

					break;
				}

				case MessageType.Plain: {
					const plainMessage = message as PlainMessage;
					if (
						!plainMessage.payload
						|| typeof plainMessage.payload.value !== 'number'
						|| typeof plainMessage.payload.text !== 'string'
					) {
						fail('plain payload shape mismatch');
					}

					const response: PlainMessage = {
						type: MessageType.Plain,
						payload: {
							value: plainMessage.payload.value + 1,
							text: `${plainMessage.payload.text}:worker`,
						},
					};

					JSWorkerParent!.postMessage(response);
					break;
				}

				case MessageType.Full: {
					const payload = message.payload;
					assertDeepMixedGraph(payload);

					assertVector2(payload.variantInJsObject.nested.marker, 3, 9, 'variantInJsObject.nested.marker');

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
						fail('map was not a Map');
					}

					assertVector2(payload.map.get('vector'), 1, 2, 'map.vector');

					if (payload.map.get('number') !== 7) {
						fail('map.number mismatch');
					}

					payload.map.set('workerVector', new Vector2(8, 8));

					if (!(payload.set instanceof Set)) {
						fail('set was not a Set');
					}

					if (!payload.set.has('alpha')) {
						fail('set did not contain alpha');
					}

					payload.set.add('workerValue');

					if (!(payload.transferBuffer instanceof ArrayBuffer)) {
						fail(`transferBuffer was not an ArrayBuffer (${describeValueShape(payload.transferBuffer)})`);
					}

					const bytes = new Uint8Array(payload.transferBuffer);

					if (bytes.length < 4) {
						fail('transferBuffer length was too small');
					}

					bytes[0] = 99;

					if (payload.bigIntValue !== BigInt('900719925474099312345')) {
						fail(`bigIntValue mismatch: ${payload.bigIntValue.toString()}`);
					}
					payload.bigIntValue = BigInt('987654321012345678');

					if (!(payload.dateValue instanceof Date)) {
						fail('dateValue was not a Date');
					}
					if (payload.dateValue.toISOString() !== '2020-01-02T03:04:05.678Z') {
						fail(`dateValue mismatch: ${payload.dateValue.toISOString()}`);
					}
					payload.dateValue = new Date('2020-01-02T03:04:06.789Z');

					if (!(payload.regExpValue instanceof RegExp)) {
						fail('regExpValue was not a RegExp');
					}
					if (payload.regExpValue.source !== 'worker-roundtrip' || payload.regExpValue.flags !== 'gi') {
						fail(`regExpValue mismatch: /${payload.regExpValue.source}/${payload.regExpValue.flags}`);
					}
					payload.regExpValue = /worker-roundtrip-updated/gi;

					if (!(payload.typedArrayValue instanceof Uint16Array)) {
						fail('typedArrayValue was not a Uint16Array');
					}
					if (
						payload.typedArrayValue.length !== 4 ||
						payload.typedArrayValue[0] !== 10 ||
						payload.typedArrayValue[1] !== 20 ||
						payload.typedArrayValue[2] !== 30 ||
						payload.typedArrayValue[3] !== 4000
					) {
						fail(`typedArrayValue mismatch: [${Array.from(payload.typedArrayValue).join(', ')}]`);
					}
					payload.typedArrayValue[0] = 42;

					if (!(payload.scriptedNodeWithExport instanceof TransferScriptedNode)) {
						fail(`scriptedNodeWithExport was not a TransferScriptedNode (${describeValueShape(payload.scriptedNodeWithExport)})`);
					}
					if (payload.scriptedNodeWithExport.exportInt !== 123) {
						fail(`scriptedNodeWithExport.exportInt mismatch: ${String(payload.scriptedNodeWithExport.exportInt)}`);
					}
					if (payload.scriptedNodeWithExport.exportText !== 'main-initial') {
						fail(`scriptedNodeWithExport.exportText mismatch: ${String(payload.scriptedNodeWithExport.exportText)}`);
					}

					if (message.transferType === TransferType.Godot) {
						if (payload.scriptedNodeWithExport.get_child_count() < 1) {
							fail('scriptedNodeWithExport child was not accessible in worker');
						}
						const transferredChild = payload.scriptedNodeWithExport.get_child(0);
						if (!(transferredChild instanceof Node)) {
							fail('scriptedNodeWithExport child was not a Node in worker');
						}
						if (transferredChild.get_name() !== 'implicit-child') {
							fail(`scriptedNodeWithExport child name mismatch in worker: ${transferredChild.get_name()}`);
						}
						transferredChild.set_name('implicit-child-worker');
					}
					payload.scriptedNodeWithExport.exportInt = 456;
					payload.scriptedNodeWithExport.exportText = 'worker-mutated';

					if (payload.cyclicNode.self !== payload.cyclicNode) {
						fail('cyclicNode.self identity mismatch');
					}
					if (payload.cyclicNode.child?.parent !== payload.cyclicNode) {
						fail('cyclicNode.child.parent identity mismatch');
					}
					payload.cyclicNode.workerTag = 'seen-in-worker';

					if (!Array.isArray(payload.cyclicArray)) {
						fail('cyclicArray was not an Array');
					}
					if (payload.cyclicArray[0] !== payload.cyclicNode) {
						fail('cyclicArray[0] did not reference cyclicNode');
					}
					if (payload.cyclicArray[1] !== payload.cyclicArray) {
						fail('cyclicArray self-reference mismatch');
					}
					payload.cyclicArray.push('worker-mark');

					payload.deepMixedGraph.objectWithVariantAndCollections.marker = new Vector2(77, 88);
					payload.deepMixedGraph.objectWithVariantAndCollections.typed[0] = 100;
					payload.deepMixedGraph.objectWithVariantAndCollections.nestedSet.add(new Date('2024-05-06T07:08:09.000Z'));
					payload.deepMixedGraph.objectWithVariantAndCollections.nestedSet.add(/deep-worker/g);

					const deepCycleNode = payload.deepMixedGraph.objectWithVariantAndCollections.nestedMap.get('cycleNode');
					if (typeof deepCycleNode !== 'object' || deepCycleNode === null) {
						fail('deepMixedGraph nestedMap.cycleNode missing during mutation');
					}
					payload.deepMixedGraph.mapWithComplexValues.set('typed', new Uint16Array([200, 201]));

					const mirror = payload.deepMixedGraph.mapWithComplexValues.get('mirror');
					if (!(mirror instanceof Map)) {
						fail('deepMixedGraph mapWithComplexValues.mirror was not a Map');
					}
					mirror.set('set', payload.deepMixedGraph.objectWithVariantAndCollections.nestedSet);
					payload.deepMixedGraph.setWithComplexValues.add(payload.deepMixedGraph.mapWithComplexValues);

					const response: FullPayloadMessage = {
						type: MessageType.Full,
						payload,
						transferType: message.transferType,
					};

					const transfers = [nestedJsResource, nestedDictionaryResource, payload.transferredInDictionary, payload.scriptedNodeWithExport];

					JSWorkerParent!.postMessage(
						response,
						message.transferType === TransferType.Godot ? buildGodotTransferList(transfers) : transfers
					);

					break;
				}

				case MessageType.WorkerError:
					fail(`unexpected worker error envelope: ${message.message}`);
					break;
			}
		} catch (error) {
			JSWorkerParent!.postMessage({
				type: MessageType.WorkerError,
				message: formatUnknownError(error),
			});
			throw error;
		}
	};
}
