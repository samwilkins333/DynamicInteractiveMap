export declare type Opt<T> = T | null | undefined;
export declare type IterateHandler<K, V, I> = (entry: {
    key: K;
    value: V;
}, index: number, arg?: I) => any;
export declare type PredicateFilter<K, V, I> = (entry: {
    key: K;
    value: V;
}, arg: I) => boolean;
export declare namespace MapUtils {
    const valuesOf: <K, V>(map: Map<K, V>) => V[];
    const keysOf: <K, V>(map: Map<K, V>) => K[];
    const iterate: <K, V, I>(map: Map<K, V>, action: IterateHandler<K, V, I>, info?: I | undefined) => void;
    const deepCopy: <K, V, I>(map: Map<K, V>, opts?: {
        predicate: PredicateFilter<K, V, I>;
        info: I;
    } | undefined) => Map<K, V>;
}
