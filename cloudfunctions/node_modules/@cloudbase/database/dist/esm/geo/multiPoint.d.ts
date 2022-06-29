import { Point } from './point';
import { ISerializedMultiPoint } from './interface';
export declare class MultiPoint {
    readonly points: Point[];
    constructor(points: Point[]);
    parse(key: any): {
        [x: number]: {
            type: string;
            coordinates: number[][];
        };
    };
    toJSON(): {
        type: string;
        coordinates: number[][];
    };
    static validate(multiPoint: ISerializedMultiPoint): boolean;
    readonly _internalType: import("../utils/symbol").InternalSymbol;
}
