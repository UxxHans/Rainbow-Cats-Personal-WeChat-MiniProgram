import { Validate } from '../validate';
import { SYMBOL_GEO_POINT } from '../helper/symbol';
import { isArray } from '../utils/type';
export class Point {
    constructor(longitude, latitude) {
        Validate.isGeopoint('longitude', longitude);
        Validate.isGeopoint('latitude', latitude);
        this.longitude = longitude;
        this.latitude = latitude;
    }
    parse(key) {
        return {
            [key]: {
                type: 'Point',
                coordinates: [this.longitude, this.latitude]
            }
        };
    }
    toJSON() {
        return {
            type: 'Point',
            coordinates: [
                this.longitude,
                this.latitude,
            ],
        };
    }
    toReadableString() {
        return `[${this.longitude},${this.latitude}]`;
    }
    static validate(point) {
        return point.type === 'Point' &&
            isArray(point.coordinates) &&
            Validate.isGeopoint('longitude', point.coordinates[0]) &&
            Validate.isGeopoint('latitude', point.coordinates[1]);
    }
    get _internalType() {
        return SYMBOL_GEO_POINT;
    }
}
