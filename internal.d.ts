// object extensions from apputils
interface String {
    replaceAll: (search: string, replace: string) => string;
}

interface Map<K, V> {
    toObject: () => any;
    toArray: () => any[];
    toToupleArray: () => [string, any][]; // MapToupleArray
}

interface Array<T> {
    mathMax: () => number;
    mathMin: () => number;

    arrayDiff: (arr: any[]) => any[];
    shuffle: () => void;
}