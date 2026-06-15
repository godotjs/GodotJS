const godot = require("godot");
const base = require("./transitive-base");

class TransitiveDependent extends godot.Node {
    getCombined() {
        return base.baseValue() + 1;
    }
}

module.exports.default = TransitiveDependent;
