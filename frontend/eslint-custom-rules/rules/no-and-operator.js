const createRule = () => ({
  create(context) {
    return {
      LogicalExpression(node) {
        const isJsx = node.parent && node.parent.type === "JSXExpressionContainer";

        if (node.operator === "&&" && isJsx) {
          context.report({
            message: "Use a ternary operator instead of '&&' in JSX",
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description: "Enforce ternary operator usage instead of '&&' in JSX",
    },
    type: "suggestion",
  },
});

export default createRule();
