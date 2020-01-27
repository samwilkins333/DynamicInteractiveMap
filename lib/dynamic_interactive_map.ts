import { action, observable, computed } from "mobx";
import { IterateHandler, Opt, MapUtils, PredicateFilter } from "./map_utilities";
import { AssertionError } from "assert";

export type Orderable<V> = keyof V | "unordered";

export interface Matchable {
    matches: (filter: string, isCaseSensitive: boolean) => boolean;
}

export namespace Compare {
    export namespace Map {
        export type ByKey<T> = (a: [T, any], b: [T, any]) => number;
        export type ByValue<T> = (a: [any, T], b: [any, T]) => number;
    }
}

export namespace Comparators {
    export const unsorted = () => 0;
    export const sorted = <T>(key: keyof T, descending = true) => (a: [string, T], b: [string, T]) => {
        const first = a[1][key];
        const second = b[1][key];
        if (second === first) {
            return 0;
        }
        return (second > first ? -1 : 1) * (descending ? 1 : -1);
    }
}

export default class DynamicInteractiveMap<K, V extends Matchable> {
    @observable private initial_state: Map<K, V>;
    @observable private current_state: Map<K, V>;
    private predicateFilter: PredicateFilter<K, V, string> = (e, query) => {
        if (!this.isCaseSensitive) {
            query = query.toLowerCase();
        }
        return e.value.matches(query, this.isCaseSensitive);
    }

    private _orderingHandler: Opt<IterateHandler<K, V, Orderable<V>>>;
    @observable private isCaseSensitive: boolean = false;

    @observable private _orderingCache: Map<Orderable<V>, K[]>;
    @observable private _currentOrdering: Orderable<V>;
    @observable private _currentFilter: string;
    @observable private _currentComparator?: Compare.Map.ByValue<V>;

    constructor(init: Map<K, V>, d: Orderable<V>, h?: IterateHandler<K, V, Orderable<V>>) {
        this.initial_state = MapUtils.deepCopy(init);
        this.current_state = MapUtils.deepCopy(init);

        this._orderingCache = new Map<keyof V, K[]>();
        this._orderingHandler = h;

        this._currentOrdering = d;
        this._currentFilter = ""

        this.cache(this.initial_state, this.currentOrdering);
    }

    @computed
    public get render() {
        return MapUtils.valuesOf(this.current);
    }

    @computed
    public get currentOrdering() {
        return this._currentOrdering;
    }

    @computed
    public get initial() {
        return this.initial_state;
    }

    @computed
    public get current() {
        return this.current_state
    }

    @action
    setCaseSensitivity = (value: boolean) => {
        this.isCaseSensitive = value;
        this.filterBy(undefined);
    }

    @action
    sortBy = (comparator: Compare.Map.ByValue<V>, ordering: Orderable<V>, updateGui: boolean = true) => {
        let source: Opt<Map<K, V>> = null;
        this._currentComparator = comparator;

        if (updateGui) {
            // if it is in the cache, we have no need to...
            if (!this.apply(ordering)) source = this.current_state;
        } else source = new Map();

        // ...rebuild it here
        if (source !== null) {
            source = new Map(Array.from(this.initial_state.entries()).sort(comparator))
            if (this._orderingHandler) MapUtils.iterate(source, this._orderingHandler, ordering);
            this.cache(source, ordering);
        }

        if (updateGui) this.filterBy(this._currentFilter);
    }

    @action
    insert = (key: K, value: V) => {
        this.initial_state.set(key, value);
        this._orderingCache = new Map<keyof V, K[]>();
        this.sortBy(this._currentComparator!, this.currentOrdering);
    }

    @action
    filterBy = (phrase?: string) => {
        if (phrase !== undefined) this._currentFilter = phrase.trim();
        // reconstruct full ordered map from ranking cache (ignores previous filter state)
        // order it appropriately
        if (!this.apply(this._currentOrdering))
            throw new AssertionError({ message: `This ordering (${this._currentOrdering}) should be in cache!` });

        // if no filter phrase, no need to remove entries
        if (this._currentFilter.length === 0) return;
        // set this.activities to a deep copy of itself containing only matching entries
        this.current_state = MapUtils.deepCopy(this.current_state, {
            predicate: this.predicateFilter,
            info: this._currentFilter
        });
    }

    @action
    invalidateOrdering = (ordering: keyof V) => this._orderingCache.delete(ordering);

    // maintains an insertion-ordered list of activity ids,
    // capturing a lightweight snapshot of the map ordering
    @action
    cache = (src: Map<K, V>, ordering: Orderable<V>) => {
        let record: K[] = [];
        MapUtils.iterate(src, (e) => record.push(e.key));
        this._orderingCache.set(ordering, record);
    }

    @action
    apply = (ordering: Orderable<V>) => {
        this._currentOrdering = ordering
        let cached = this._orderingCache.get(ordering);
        if (!cached) return false;

        let record = new Map<K, V>();
        cached.forEach(key => record.set(key, this.initial_state.get(key)!));

        this.current_state = record;
        return true;
    }
}