import { AnyObject } from 'typings';
export declare class Decoder {
    private constructor();
    static decode(data: object | object[]): object;
    decodeData(data: AnyObject | AnyObject[]): AnyObject | AnyObject[];
    decodeObject(data: AnyObject): AnyObject;
}
