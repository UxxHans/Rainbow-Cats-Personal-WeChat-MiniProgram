declare enum ErrorCode {
    DocIDError = "\u6587\u6863ID\u4E0D\u5408\u6CD5",
    CollNameError = "\u96C6\u5408\u540D\u79F0\u4E0D\u5408\u6CD5",
    OpStrError = "\u64CD\u4F5C\u7B26\u4E0D\u5408\u6CD5",
    DirectionError = "\u6392\u5E8F\u5B57\u7B26\u4E0D\u5408\u6CD5",
    IntergerError = "must be integer"
}
declare const FieldType: {
    String: string;
    Number: string;
    Object: string;
    Array: string;
    Boolean: string;
    Null: string;
    GeoPoint: string;
    GeoLineString: string;
    GeoPolygon: string;
    GeoMultiPoint: string;
    GeoMultiLineString: string;
    GeoMultiPolygon: string;
    Timestamp: string;
    Command: string;
    ServerDate: string;
};
declare type OrderByDirection = "desc" | "asc";
declare const OrderDirectionList: string[];
declare type WhereFilterOp = "<" | "<=" | "==" | ">=" | ">";
declare const WhereFilterOpList: string[];
declare enum Opeartor {
    lt = "<",
    gt = ">",
    lte = "<=",
    gte = ">=",
    eq = "=="
}
declare const OperatorMap: {
    [Opeartor.eq]: string;
    [Opeartor.lt]: string;
    [Opeartor.lte]: string;
    [Opeartor.gt]: string;
    [Opeartor.gte]: string;
};
declare const UpdateOperatorList: string[];
export { ErrorCode, FieldType, WhereFilterOp, WhereFilterOpList, Opeartor, OperatorMap, OrderByDirection, OrderDirectionList, UpdateOperatorList };
