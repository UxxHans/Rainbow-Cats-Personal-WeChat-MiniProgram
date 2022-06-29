export declare class RegExp {
    $regex: string;
    $options: string;
    constructor({ regexp, options }: {
        regexp: any;
        options: any;
    });
    parse(): {
        $regex: string;
        $options: string;
    };
    readonly _internalType: import("../utils/symbol").InternalSymbol;
}
export declare function RegExpConstructor(param: any): RegExp;
