const createRule = () => ({
  create(context) {
    const checkUnionTypes = (node) => {
      if (node.type === "TSUnionType") {
        const source = context.getSourceCode();
        const types = node.types;
        const sortedTypes = types.slice().sort((first, second) => {
          const aText = source.getText(first);
          const bText = source.getText(second);

          return aText < bText ? -1 : 1;
        });

        const currentText = JSON.stringify(types.map((type) => source.getText(type)));
        const sortedText = JSON.stringify(sortedTypes.map((type) => source.getText(type)));

        if (currentText !== sortedText) {
          context.report({
            fix(fixer) {
              const joined = sortedTypes.map((type) => source.getText(type)).join(" | ");

              return fixer.replaceText(node, joined);
            },
            message: "Type union members should be in alphabetical order",
            node,
          });
        }
      }
    };

    return {
      TSPropertySignature(node) {
        if (node.typeAnnotation?.typeAnnotation) {
          checkUnionTypes(node.typeAnnotation.typeAnnotation);
        }
      },
      TSTypeAliasDeclaration(node) {
        if (node.typeAnnotation) {
          checkUnionTypes(node.typeAnnotation);
        }
      },
    };
  },
  meta: {
    docs: { description: "enforce alphabetical order in type unions" },
    fixable: "code",
    schema: [],
    type: "suggestion",
  },
});

export default createRule();
