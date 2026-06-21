import answer, { HELLO } from "./hello";

if (answer !== 42) {
    throw new Error(`default export mismatch: expected 42, got ${answer}`);
}
if (HELLO !== "world") {
    throw new Error(`named export mismatch: expected "world", got ${HELLO}`);
}
