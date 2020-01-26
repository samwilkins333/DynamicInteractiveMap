export type Opt<T> = T | null | undefined;
export type IterateHandler<K, V, I> = (entry: { key: K, value: V }, index: number, arg?: I) => any
export type PredicateFilter<K, V, I> = (entry: { key: K, value: V }, arg: I) => boolean

export namespace MapUtils {

    export const valuesOf = <K, V>(map: Map<K, V>) => {
        return Array.from(map, ([, value]) => value);
    }

    export const keysOf = <K, V>(map: Map<K, V>) => {
        return Array.from(map, ([key,]) => key);
    }

    export const iterate = <K, V, I>(map: Map<K, V>, action: IterateHandler<K, V, I>, info?: I) => {
        let entries = map.entries();
        let next = entries.next(), index = 0;
        while (!next.done) {
            let entry = next.value;
            action({ key: entry[0], value: entry[1] }, index, info);
            next = entries.next();
            index++;
        }
    }

    export const deepCopy = <K, V, I>(map: Map<K, V>, opts?: { predicate: PredicateFilter<K, V, I>, info: I }) => {
        let deepCopy = new Map<K, V>();
        iterate(map, (e) => {
            if (!opts || opts.predicate(e, opts.info)) {
                deepCopy.set(e.key, e.value);
            }
        });
        return deepCopy;
    }
}