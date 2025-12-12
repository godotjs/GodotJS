import Child from "./child";

export default class TestExtend extends Child {
    _ready() {
        super._ready();
        console.log("TestExtend ready");
        console.assert(this.childFn());
    }
}
