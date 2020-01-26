import { IterateHandler } from "./map_utilities";
export declare type Orderable<V> = keyof V | "unordered";
export interface Matchable {
    matches: (filter: string, isCaseSensitive: boolean) => boolean;
}
export declare namespace Compare {
    namespace Map {
        type ByKey<T> = (a: [T, any], b: [T, any]) => number;
        type ByValue<T> = (a: [any, T], b: [any, T]) => number;
    }
}
export declare namespace Comparators {
    const unsorted: () => number;
    const sorted: <T>(key: keyof T, descending?: boolean) => (a: [string, T], b: [string, T]) => number;
}
export default class DynamicOrderedMap<K, V extends Matchable> {
    private initial_state;
    private current_state;
    private predicateFilter;
    private _orderingHandler;
    private isCaseSensitive;
    private _orderingCache;
    private _currentOrdering;
    private _currentFilter;
    private _currentComparator?;
    constructor(init: Map<K, V>, d: Orderable<V>, h?: IterateHandler<K, V, Orderable<V>>);
    get currentOrdering(): Orderable<V>;
    get initial(): Map<K, V>;
    get current(): Map<K, V>;
    setCaseSensitivity: (value: boolean) => void;
    sortBy: (comparator: Compare.Map.ByValue<V>, ordering: Orderable<V>, updateGui?: boolean) => void;
    insert: (key: K, value: V) => void;
    filterBy: (phrase?: string | undefined) => void;
    invalidateOrdering: (ordering: keyof V) => boolean;
    cache: (src: Map<K, V>, ordering: Orderable<V>) => void;
    apply: (ordering: Orderable<V>) => boolean;
}
