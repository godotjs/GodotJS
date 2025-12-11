import { FileAccess, Node } from "godot"; /*
import Papa from "papaparse";*/

export default class TestPapaparse extends Node {
    _ready() {
        const file = FileAccess.open("res://config/test.notcsv", FileAccess.ModeFlags.READ);
        console.assert(file !== null);
        if (file) {
            let fileContent: string = "";
            while (!file.eof_reached()) {
                fileContent += `${file.get_line()}\n`;
            }
            console.log("Read file:\n", fileContent);
            console.assert(fileContent.includes("TEST,test"));

            // TODO: node_modules aren't working directly
            /*
            const csvFile = Papa.parse(fileContent);
            console.log(JSON.stringify(csvFile));*/
        }
    }
}
