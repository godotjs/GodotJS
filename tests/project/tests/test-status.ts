export const TEST_COMPLETION_SENTINEL = "GODOTJS_TEST_PROJECT_COMPLETED";
export const TEST_FAILURE_SENTINEL_PREFIX = "GODOTJS_TEST_PROJECT_FAILED:";

let firstFailureContext: string | null = null;
let activeAsyncTests = 0;

function formatError(error: unknown): string {
	if (error instanceof Error) {
		return error.stack ?? error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
}

export function hasTestFailure(): boolean {
	return firstFailureContext !== null;
}

export function beginAsyncTest(): void {
	activeAsyncTests += 1;
}

export function endAsyncTest(): void {
	if (activeAsyncTests > 0) {
		activeAsyncTests -= 1;
	}
}

export function hasActiveAsyncTests(): boolean {
	return activeAsyncTests > 0;
}

export function getActiveAsyncTestCount(): number {
	return activeAsyncTests;
}

export function reportTestFailure(context: string, error?: unknown): void {
	if (firstFailureContext !== null) {
		return;
	}
	firstFailureContext = context;
	console.error(`${TEST_FAILURE_SENTINEL_PREFIX} ${context}`);
	if (error !== undefined) {
		console.error(formatError(error));
	}
}

export function reportTestCompleted(): void {
	if (firstFailureContext !== null) {
		return;
	}
	console.log(TEST_COMPLETION_SENTINEL);
}
