import { GArray, GDictionary } from "godot";

(function (items: Array<{ class: any, func: Function }>) {
    for (let item of items) {
        item.class.prototype[Symbol.iterator] = item.func;
    }
})(
    [
        {
            class: GDictionary,
            func: function* () {
                let self: GDictionary = <any>this;
                let keys = self.keys();
                for (let i = 0; i < keys.size(); ++i) {
                    const key = keys.get_indexed(i);
                    yield { key: key, value: self.get_keyed(key) };
                }
            }
        },
        {
            class: GArray,
            func: function* () {
                let self: GArray = <any>this;
                for (let i = 0; i < self.size(); ++i) {
                    yield self.get_indexed(i);
                }
            }
        }
    ]
);
