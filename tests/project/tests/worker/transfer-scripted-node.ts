import { Node, Variant } from "godot";
import { createClassBinder } from "godot.annotations";

const bind = createClassBinder();

@bind()
export default class TransferScriptedNode extends Node {
	@bind.export(Variant.Type.TYPE_INT)
	accessor exportInt: number = 0;

	@bind.export(Variant.Type.TYPE_STRING)
	accessor exportText: string = "";
}
