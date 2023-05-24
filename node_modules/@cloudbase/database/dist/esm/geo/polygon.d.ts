import { LineString } from './lineString';
import { ISerializedPolygon } from './interface';
export declare class Polygon {
    readonly lines: LineString[];
    constructor(lines: LineString[]);
    parse(key: any): {
        [x: number]: {
            type: string;
            coordinates: number[][][];
        };
    };
    toJSON(): {
        type: string;
        coordinates: number[][][];
    };
    static validate(polygon: ISerializedPolygon): boolean;
    static isCloseLineString(lineString: any): boolean;
    readonly _internalType: import("../utils/symbol").InternalSymbol;
}
