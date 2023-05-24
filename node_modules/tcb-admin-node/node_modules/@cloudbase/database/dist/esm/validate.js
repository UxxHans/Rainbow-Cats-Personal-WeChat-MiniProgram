import { ErrorCode, WhereFilterOpList, OrderDirectionList, FieldType } from './constant';
import { Util } from './util';
export class Validate {
    static isGeopoint(point, degree) {
        if (Util.whichType(degree) !== FieldType.Number) {
            throw new Error('Geo Point must be number type');
        }
        const degreeAbs = Math.abs(degree);
        if (point === 'latitude' && degreeAbs > 90) {
            throw new Error('latitude should be a number ranges from -90 to 90');
        }
        else if (point === 'longitude' && degreeAbs > 180) {
            throw new Error('longitude should be a number ranges from -180 to 180');
        }
        return true;
    }
    static isInteger(param, num) {
        if (!Number.isInteger(num)) {
            throw new Error(param + ErrorCode.IntergerError);
        }
        return true;
    }
    static isFieldOrder(direction) {
        if (OrderDirectionList.indexOf(direction) === -1) {
            throw new Error(ErrorCode.DirectionError);
        }
        return true;
    }
    static isFieldPath(path) {
        if (!/^[a-zA-Z0-9-_\.]/.test(path)) {
            throw new Error();
        }
        return true;
    }
    static isOperator(op) {
        if (WhereFilterOpList.indexOf(op) === -1) {
            throw new Error(ErrorCode.OpStrError);
        }
        return true;
    }
    static isCollName(name) {
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9-_]){1,32}$/.test(name)) {
            throw new Error(ErrorCode.CollNameError);
        }
        return true;
    }
    static isDocID(docId) {
        if (!/^([a-fA-F0-9]){24}$/.test(docId)) {
            throw new Error(ErrorCode.DocIDError);
        }
        return true;
    }
}
