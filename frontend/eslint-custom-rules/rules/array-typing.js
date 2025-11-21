const createRule = () => ({
  create(context) {
    return {
      TSArrayType(node) {
        context.report({
          message: "Use Array<Type> instead of Type[]",
          node,
          fix(fixer) {
            const sourceCode = context.getSourceCode();
            const elementType = sourceCode.getText(node.elementType);

            return fixer.replaceText(node, `Array<${elementType}>`);
          },
        });
      },
    };
  },
  meta: {
    docs: { description: "enforce using Array<Type> instead of Type[]" },
    fixable: "code",
    schema: [],
    type: "suggestion",
  },
});

export default createRule();
