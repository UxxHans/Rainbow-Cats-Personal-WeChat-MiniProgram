import { SYMBOL_REGEXP } from '../helper/symbol';
export class RegExp {
    constructor({ regexp, options }) {
        if (!regexp) {
            throw new TypeError('regexp must be a string');
        }
        this.$regex = regexp;
        this.$options = options;
    }
    parse() {
        return {
            $regex: this.$regex,
            $options: this.$options
        };
    }
    get _internalType() {
        return SYMBOL_REGEXP;
    }
}
export function RegExpConstructor(param) {
    return new RegExp(param);
}
