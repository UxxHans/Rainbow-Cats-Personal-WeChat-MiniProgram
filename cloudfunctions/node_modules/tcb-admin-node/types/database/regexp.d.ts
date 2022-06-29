export declare class RegExp {
    regexp: string;
    options: string;
    constructor({ regexp, options }: {
        regexp: any;
        options: any;
    });
    parse(): {
        $regex: string;
        $options: string;
    };
    readonly _internalType: import("../../../../../../Users/jimmyzhang/repo/tcb-admin-node/src/database/utils/symbol").InternalSymbol;
}
export declare function RegExpConstructor(param: any): RegExp;
