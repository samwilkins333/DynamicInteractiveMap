"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var map_utilities_1 = require("./map_utilities");
var assert_1 = require("assert");
var Comparators;
(function (Comparators) {
    Comparators.unsorted = function () { return 0; };
    Comparators.sorted = function (key, descending) {
        if (descending === void 0) { descending = true; }
        return function (a, b) { return (b[1][key] > a[1][key] ? -1 : 1) * (descending ? 1 : -1); };
    };
})(Comparators = exports.Comparators || (exports.Comparators = {}));
var DynamicInteractiveMap = /** @class */ (function () {
    function DynamicInteractiveMap(init, d, h) {
        var _this = this;
        this.predicateFilter = function (e, query) {
            if (!_this.isCaseSensitive) {
                query = query.toLowerCase();
            }
            return e.value.matches(query, _this.isCaseSensitive);
        };
        this.isCaseSensitive = false;
        this.setCaseSensitivity = function (value) {
            _this.isCaseSensitive = value;
            _this.filterBy(undefined);
        };
        this.sortBy = function (comparator, ordering, updateGui) {
            if (updateGui === void 0) { updateGui = true; }
            var source = null;
            _this._currentComparator = comparator;
            if (updateGui) {
                // if it is in the cache, we have no need to...
                if (!_this.apply(ordering))
                    source = _this.current_state;
            }
            else
                source = new Map();
            // ...rebuild it here
            if (source !== null) {
                source = new Map(Array.from(_this.initial_state.entries()).sort(comparator));
                if (_this._orderingHandler)
                    map_utilities_1.MapUtils.iterate(source, _this._orderingHandler, ordering);
                _this.cache(source, ordering);
            }
            if (updateGui)
                _this.filterBy(_this._currentFilter);
        };
        this.insert = function (key, value) {
            _this.initial_state.set(key, value);
            _this._orderingCache = new Map();
            _this.sortBy(_this._currentComparator, _this.currentOrdering);
        };
        this.filterBy = function (phrase) {
            if (phrase !== undefined)
                _this._currentFilter = phrase.trim();
            // reconstruct full ordered map from ranking cache (ignores previous filter state)
            // order it appropriately
            if (!_this.apply(_this._currentOrdering))
                throw new assert_1.AssertionError({ message: "This ordering (" + _this._currentOrdering + ") should be in cache!" });
            // if no filter phrase, no need to remove entries
            if (_this._currentFilter.length === 0)
                return;
            // set this.activities to a deep copy of itself containing only matching entries
            _this.current_state = map_utilities_1.MapUtils.deepCopy(_this.current_state, {
                predicate: _this.predicateFilter,
                info: _this._currentFilter
            });
        };
        this.invalidateOrdering = function (ordering) { return _this._orderingCache.delete(ordering); };
        // maintains an insertion-ordered list of activity ids,
        // capturing a lightweight snapshot of the map ordering
        this.cache = function (src, ordering) {
            var record = [];
            map_utilities_1.MapUtils.iterate(src, function (e) { return record.push(e.key); });
            _this._orderingCache.set(ordering, record);
        };
        this.apply = function (ordering) {
            _this._currentOrdering = ordering;
            var cached = _this._orderingCache.get(ordering);
            if (!cached)
                return false;
            var record = new Map();
            cached.forEach(function (key) { return record.set(key, _this.initial_state.get(key)); });
            _this.current_state = record;
            return true;
        };
        this.initial_state = map_utilities_1.MapUtils.deepCopy(init);
        this.current_state = map_utilities_1.MapUtils.deepCopy(init);
        this._orderingCache = new Map();
        this._orderingHandler = h;
        this._currentOrdering = d;
        this._currentFilter = "";
        this.cache(this.initial_state, this.currentOrdering);
    }
    Object.defineProperty(DynamicInteractiveMap.prototype, "render", {
        get: function () {
            return map_utilities_1.MapUtils.valuesOf(this.current);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicInteractiveMap.prototype, "currentOrdering", {
        get: function () {
            return this._currentOrdering;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicInteractiveMap.prototype, "initial", {
        get: function () {
            return this.initial_state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicInteractiveMap.prototype, "current", {
        get: function () {
            return this.current_state;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        mobx_1.observable
    ], DynamicInteractiveMap.prototype, "initial_state", void 0);
    __decorate([
        mobx_1.observable
    ], DynamicInteractiveMap.prototype, "current_state", void 0);
    __decorate([
        mobx_1.observable
    ], DynamicInteractiveMap.prototype, "isCaseSensitive", void 0);
    __decorate([
        mobx_1.observable
    ], DynamicInteractiveMap.prototype, "_orderingCache", void 0);
    __decorate([
        mobx_1.observable
    ], DynamicInteractiveMap.prototype, "_currentOrdering", void 0);
    __decorate([
        mobx_1.observable
    ], DynamicInteractiveMap.prototype, "_currentFilter", void 0);
    __decorate([
        mobx_1.observable
    ], DynamicInteractiveMap.prototype, "_currentComparator", void 0);
    __decorate([
        mobx_1.computed
    ], DynamicInteractiveMap.prototype, "render", null);
    __decorate([
        mobx_1.computed
    ], DynamicInteractiveMap.prototype, "currentOrdering", null);
    __decorate([
        mobx_1.computed
    ], DynamicInteractiveMap.prototype, "initial", null);
    __decorate([
        mobx_1.computed
    ], DynamicInteractiveMap.prototype, "current", null);
    __decorate([
        mobx_1.action
    ], DynamicInteractiveMap.prototype, "setCaseSensitivity", void 0);
    __decorate([
        mobx_1.action
    ], DynamicInteractiveMap.prototype, "sortBy", void 0);
    __decorate([
        mobx_1.action
    ], DynamicInteractiveMap.prototype, "insert", void 0);
    __decorate([
        mobx_1.action
    ], DynamicInteractiveMap.prototype, "filterBy", void 0);
    __decorate([
        mobx_1.action
    ], DynamicInteractiveMap.prototype, "invalidateOrdering", void 0);
    __decorate([
        mobx_1.action
    ], DynamicInteractiveMap.prototype, "cache", void 0);
    __decorate([
        mobx_1.action
    ], DynamicInteractiveMap.prototype, "apply", void 0);
    return DynamicInteractiveMap;
}());
exports.default = DynamicInteractiveMap;
