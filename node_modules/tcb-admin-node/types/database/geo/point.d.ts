import { ISerializedPoint } from './interface';
export declare class Point {
    readonly latitude: number;
    readonly longitude: number;
    constructor(longitude: number, latitude: number);
    parse(key: any): {
        [x: number]: {
            type: string;
            coordinates: number[];
        };
    };
    toJSON(): {
        type: string;
        coordinates: number[];
    };
    toReadableString(): string;
    static validate(point: ISerializedPoint): boolean;
    readonly _internalType: import("../utils/symbol").InternalSymbol;
}
