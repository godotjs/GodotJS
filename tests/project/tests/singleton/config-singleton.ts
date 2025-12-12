import { Node } from "godot";
import TestJson from "res://config/test.json";

type TestType = {
    test: boolean;
};

export default class ConfigSingleton extends Node {
    static _singleton: ConfigSingleton;

    static get singleton() {
        return ConfigSingleton._singleton;
    }

    constructor() {
        super();
        if (!ConfigSingleton._singleton) {
            ConfigSingleton._singleton = this;
        }
    }

    testType: TestType = TestJson as TestType;

    logTestType() {
        console.assert(this.testType.test);
        console.log("config:", JSON.stringify(this.testType));
    }
}
