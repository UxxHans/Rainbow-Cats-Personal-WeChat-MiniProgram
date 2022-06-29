import { SYMBOL_GEO_MULTI_POINT } from '../helper/symbol';
import { Point } from './point';
import { isArray, isNumber } from '../utils/type';
export class MultiPoint {
    constructor(points) {
        if (!isArray(points)) {
            throw new TypeError(`"points" must be of type Point[]. Received type ${typeof points}`);
        }
        if (points.length === 0) {
            throw new Error('"points" must contain 1 point at least');
        }
        points.forEach(point => {
            if (!(point instanceof Point)) {
                throw new TypeError(`"points" must be of type Point[]. Received type ${typeof point}[]`);
            }
        });
        this.points = points;
    }
    parse(key) {
        return {
            [key]: {
                type: 'MultiPoint',
                coordinates: this.points.map(point => point.toJSON().coordinates)
            }
        };
    }
    toJSON() {
        return {
            type: 'MultiPoint',
            coordinates: this.points.map(point => point.toJSON().coordinates)
        };
    }
    static validate(multiPoint) {
        if (multiPoint.type !== 'MultiPoint' || !isArray(multiPoint.coordinates)) {
            return false;
        }
        for (let point of multiPoint.coordinates) {
            if (!isNumber(point[0]) || !isNumber(point[1])) {
                return false;
            }
        }
        return true;
    }
    get _internalType() {
        return SYMBOL_GEO_MULTI_POINT;
    }
}
