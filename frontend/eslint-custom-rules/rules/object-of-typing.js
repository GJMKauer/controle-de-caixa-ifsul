const createRule = () => ({
  create(context) {
    const filename = context.getFilename();

    if (filename.includes("/types/ObjectOf.ts")) {
      return {};
    }

    const isIndexSignature = (member) =>
      member.type === "TSIndexSignature" && member.typeAnnotation;

    const checkTypeLiteral = (node) => {
      if (node.members.length === 1 && isIndexSignature(node.members[0])) {
        const valueType = node.members[0].typeAnnotation.typeAnnotation;
        const sourceCode = context.getSourceCode();
        const valueTypeText = sourceCode.getText(valueType);

        context.report({
          fix(fixer) {
            return fixer.replaceText(node, `ObjectOf<${valueTypeText}>`);
          },
          message:
            "Use ObjectOf<T> type alias instead of { [key: Type]: ValueType }",
          node,
        });
      }
    };

    return {
      TSPropertySignature(node) {
        if (node.typeAnnotation?.typeAnnotation?.type === "TSTypeLiteral") {
          checkTypeLiteral(node.typeAnnotation.typeAnnotation);
        }
      },
      TSTypeAliasDeclaration(node) {
        if (node.typeAnnotation?.type === "TSTypeLiteral") {
          checkTypeLiteral(node.typeAnnotation);
        }
      },
      TSTypeLiteral(node) {
        checkTypeLiteral(node);
      },
    };
  },
  meta: {
    docs: {
      description:
        "enforce using ObjectOf<T> type alias instead of direct object type",
    },
    fixable: "code",
    schema: [],
    type: "suggestion",
  },
});

export default createRule();
