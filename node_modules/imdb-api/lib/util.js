"use strict";
exports.__esModule = true;
var Inverter = (function () {
    function Inverter(obj) {
        this.obj = obj;
        this.rev_obj = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                this.rev_obj[obj[attr]] = attr;
            }
        }
    }
    Inverter.prototype.get = function (key) {
        if (this.obj[key] !== undefined) {
            return this.obj[key];
        }
        else if (this.rev_obj[key] !== undefined) {
            return this.rev_obj[key];
        }
        return undefined;
    };
    return Inverter;
}());
exports.Inverter = Inverter;
//# sourceMappingURL=util.js.map