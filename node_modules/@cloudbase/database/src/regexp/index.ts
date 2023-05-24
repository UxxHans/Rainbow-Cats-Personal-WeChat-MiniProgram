import { SYMBOL_REGEXP } from '../helper/symbol'

export class RegExp {
  $regularExpression?: {
    pattern?: string
    options?: string
  }

  constructor({ regexp, options }) {
    if (!regexp) {
      throw new TypeError('regexp must be a string')
    }

    this.$regularExpression = {
      pattern: regexp || '',
      options: options || ''
    }
  }

  parse() {
    return {
      $regularExpression: {
        pattern: this.$regularExpression.pattern,
        options: this.$regularExpression.options
      }
    }
  }

  get _internalType() {
    return SYMBOL_REGEXP
  }
}

export function RegExpConstructor(param) {
  return new RegExp(param)
}
