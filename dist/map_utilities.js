"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapUtils;
(function (MapUtils) {
    MapUtils.valuesOf = function (map) {
        return Array.from(map, function (_a) {
            var value = _a[1];
            return value;
        });
    };
    MapUtils.keysOf = function (map) {
        return Array.from(map, function (_a) {
            var key = _a[0];
            return key;
        });
    };
    MapUtils.iterate = function (map, action, info) {
        var entries = map.entries();
        var next = entries.next(), index = 0;
        while (!next.done) {
            var entry = next.value;
            action({ key: entry[0], value: entry[1] }, index, info);
            next = entries.next();
            index++;
        }
    };
    MapUtils.deepCopy = function (map, opts) {
        var deepCopy = new Map();
        MapUtils.iterate(map, function (e) {
            if (!opts || opts.predicate(e, opts.info)) {
                deepCopy.set(e.key, e.value);
            }
        });
        return deepCopy;
    };
})(MapUtils = exports.MapUtils || (exports.MapUtils = {}));
