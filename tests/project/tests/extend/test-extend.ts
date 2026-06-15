import { PropertyUsageFlags, ResourceLoader, Script } from "godot";
import Parent from "./parent";
import { reportTestFailure } from "../test-status";

const ChildCategoryName = "test-extend.ts";
const ParentOnlyExportName = "parentOnlyExport";

function countScriptPropertiesInCategory(script: Script, categoryName: string, propertyName: string): number {
    let count = 0;
    let currentCategory = "";

    for (const property of script.get_script_property_list()) {
        const usage = property.get("usage");
        const name = property.get("name");
        if (typeof usage === "number" && (usage & PropertyUsageFlags.PROPERTY_USAGE_CATEGORY) !== 0) {
            currentCategory = typeof name === "string" ? name : "";
            continue;
        }

        if (currentCategory === categoryName && name === propertyName) {
            count += 1;
        }
    }

    return count;
}

function countScriptProperties(script: Script, propertyName: string): number {
    let count = 0;

    for (const property of script.get_script_property_list()) {
        const usage = property.get("usage");
        const name = property.get("name");
        if (typeof usage === "number" && (usage & PropertyUsageFlags.PROPERTY_USAGE_CATEGORY) !== 0) {
            continue;
        }

        if (name === propertyName) {
            count += 1;
        }
    }

    return count;
}

export default class TestExtend extends Parent {
    _ready() {
        try {
            super._ready();
            console.log("TestExtend ready");
            console.assert(this.parentFn());

            const childScript = ResourceLoader.load("res://tests/extend/test-extend.ts");

            if (!(childScript instanceof Script)) {
                throw new Error("failed to load child TestExtend script");
            }

            const totalExportCount = countScriptProperties(childScript, ParentOnlyExportName);
            const childExportCount = countScriptPropertiesInCategory(childScript, ChildCategoryName, ParentOnlyExportName);

            if (totalExportCount !== 1) {
                throw new Error(`${ParentOnlyExportName} total property count mismatch: ${totalExportCount}`);
            }
            if (childExportCount !== 0) {
                throw new Error(`${ChildCategoryName} category leaked inherited property ${ParentOnlyExportName}: ${childExportCount}`);
            }
        } catch (error) {
            reportTestFailure("extend", error);
        }
    }
}
