export default class EntityHelper {
  /**
   * @description transforms the value to float
   * @params isArray if the field is an array parse every value in it
   * @returns the transformer object
   */
  static getDecimalTransformer(isArray = false) {
    return isArray
      ? {
          array: true,
          transformer: { to: (value) => value, from: (value) => value.map(parseFloat) },
        }
      : { transformer: { to: (value) => value, from: (value) => parseFloat(value) } };
  }
}
