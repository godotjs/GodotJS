import { Node } from "godot";
import ConfigSingleton from "./config-singleton";

export default class TestSingleton extends Node {
    _ready() {
        console.log("Test singleton read", "calling config singleton");

        ConfigSingleton.singleton.logTestType();
    }
}
