import alphabeticalTypes from "./rules/alphabetical-types.js";
import arrayTyping from "./rules/array-typing.js";
import noAndOperator from "./rules/no-and-operator.js";
import noHexColors from "./rules/no-hex-colors.js";
import objectOfTyping from "./rules/object-of-typing.js";

export default {
  rules: {
    "alphabetical-types": alphabeticalTypes,
    "array-typing": arrayTyping,
    "no-and-operator": noAndOperator,
    "no-hex-colors": noHexColors,
    "object-of-typing": objectOfTyping
  }
};
