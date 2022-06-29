declare class HiddenSymbol {
    constructor(target: any);
}
export declare class InternalSymbol extends HiddenSymbol {
    constructor(target: any, __mark__: any);
    static for(target: any): InternalSymbol;
}
export default InternalSymbol;
