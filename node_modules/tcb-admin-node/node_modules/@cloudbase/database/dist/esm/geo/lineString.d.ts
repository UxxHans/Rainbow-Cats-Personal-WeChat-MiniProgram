import { Point } from './point';
import { ISerializedLineString } from './interface';
export declare class LineString {
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
    static validate(lineString: ISerializedLineString): boolean;
    static isClosed(lineString: LineString): boolean;
    readonly _internalType: import("../utils/symbol").InternalSymbol;
}
