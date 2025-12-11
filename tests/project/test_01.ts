import { Node, Signal, Variant } from "godot";
import { createClassBinder } from "godot.annotations";

export function call_me() {
  return 123;
}

const bind = createClassBinder();

@bind()
export default class TestNode extends Node {
  @bind.export(Variant.Type.TYPE_INT)
  accessor useCooldownMs: number = 500;

  @bind.signal()
  accessor no_arg!: Signal<() => void>;

  @bind.signal()
  accessor test_signal!: Signal<(value: number) => void>;

  constructor(identifier?: any) {
    super(identifier);

    // do other things you want
    //...
  }

  async _ready() {
    console.log("TestNode ready");

    const result = await this.test_signal.as_promise();
  }

  test() {
    console.log("TestNode test");
  }
}
