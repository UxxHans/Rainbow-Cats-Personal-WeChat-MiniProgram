import { SYMBOL_GEO_POINT, SYMBOL_SERVER_DATE, SYMBOL_REGEXP } from '../helper/symbol';
import { getType, isObject, isArray, isDate, isNumber, isInternalObject, isRegExp } from '../utils/type';
import { Point } from '../geo/index';
import { ServerDate } from '../serverDate/index';
export function serialize(val) {
    return serializeHelper(val, [val]);
}
function serializeHelper(val, visited) {
    if (isInternalObject(val)) {
        switch (val._internalType) {
            case SYMBOL_GEO_POINT: {
                return val.toJSON();
            }
            case SYMBOL_SERVER_DATE: {
                return val.parse();
            }
            case SYMBOL_REGEXP: {
                return val.parse();
            }
            default: {
                return val.toJSON ? val.toJSON() : val;
            }
        }
    }
    else if (isDate(val)) {
        return {
            $date: +val,
        };
    }
    else if (isRegExp(val)) {
        return {
            $regex: val.source,
            $options: val.flags,
        };
    }
    else if (isArray(val)) {
        return val.map(item => {
            if (visited.indexOf(item) > -1) {
                throw new Error('Cannot convert circular structure to JSON');
            }
            return serializeHelper(item, [
                ...visited,
                item,
            ]);
        });
    }
    else if (isObject(val)) {
        const ret = Object.assign({}, val);
        for (const key in ret) {
            if (visited.indexOf(ret[key]) > -1) {
                throw new Error('Cannot convert circular structure to JSON');
            }
            ret[key] = serializeHelper(ret[key], [
                ...visited,
                ret[key],
            ]);
        }
        return ret;
    }
    else {
        return val;
    }
}
export function deserialize(object) {
    const ret = Object.assign({}, object);
    for (const key in ret) {
        switch (key) {
            case '$date': {
                switch (getType(ret[key])) {
                    case 'number': {
                        return new Date(ret[key]);
                    }
                    case 'object': {
                        return new ServerDate(ret[key]);
                    }
                }
                break;
            }
            case 'type': {
                switch (ret.type) {
                    case 'Point': {
                        if (isArray(ret.coordinates) && isNumber(ret.coordinates[0]) && isNumber(ret.coordinates[1])) {
                            return new Point(ret.coordinates[0], ret.coordinates[1]);
                        }
                        break;
                    }
                }
                break;
            }
        }
    }
    return object;
}
