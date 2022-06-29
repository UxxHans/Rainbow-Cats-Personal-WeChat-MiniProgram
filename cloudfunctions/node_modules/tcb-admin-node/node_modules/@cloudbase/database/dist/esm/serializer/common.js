import { getType, isObject, isArray, isDate, isRegExp, isInternalObject } from '../utils/type';
import { serialize as serializeInternalDataType, deserialize as deserializeInternalDataType } from './datatype';
function flatten(query, shouldPreserverObject, parents, visited) {
    const cloned = Object.assign({}, query);
    for (const key in query) {
        if (/^\$/.test(key))
            continue;
        const value = query[key];
        if (!value)
            continue;
        if (isObject(value) && !shouldPreserverObject(value)) {
            if (visited.indexOf(value) > -1) {
                throw new Error('Cannot convert circular structure to JSON');
            }
            const newParents = [
                ...parents,
                key,
            ];
            const newVisited = [
                ...visited,
                value,
            ];
            const flattenedChild = flatten(value, shouldPreserverObject, newParents, newVisited);
            cloned[key] = flattenedChild;
            let hasKeyNotCombined = false;
            for (const childKey in flattenedChild) {
                if (!/^\$/.test(childKey)) {
                    cloned[`${key}.${childKey}`] = flattenedChild[childKey];
                    delete cloned[key][childKey];
                }
                else {
                    hasKeyNotCombined = true;
                }
            }
            if (!hasKeyNotCombined) {
                delete cloned[key];
            }
        }
    }
    return cloned;
}
export function flattenQueryObject(query) {
    return flatten(query, isConversionRequired, [], [query]);
}
export function flattenObject(object) {
    return flatten(object, (_) => false, [], [object]);
}
export function mergeConditionAfterEncode(query, condition, key) {
    if (!condition[key]) {
        delete query[key];
    }
    for (const conditionKey in condition) {
        if (query[conditionKey]) {
            if (isArray(query[conditionKey])) {
                query[conditionKey].push(condition[conditionKey]);
            }
            else if (isObject(query[conditionKey])) {
                if (isObject(condition[conditionKey])) {
                    Object.assign(query[conditionKey], condition[conditionKey]);
                }
                else {
                    console.warn(`unmergable condition, query is object but condition is ${getType(condition)}, can only overwrite`, condition, key);
                    query[conditionKey] = condition[conditionKey];
                }
            }
            else {
                console.warn(`to-merge query is of type ${getType(query)}, can only overwrite`, query, condition, key);
                query[conditionKey] = condition[conditionKey];
            }
        }
        else {
            query[conditionKey] = condition[conditionKey];
        }
    }
}
export function isConversionRequired(val) {
    return isInternalObject(val) || isDate(val) || isRegExp(val);
}
export function encodeInternalDataType(val) {
    return serializeInternalDataType(val);
}
export function decodeInternalDataType(object) {
    return deserializeInternalDataType(object);
}
