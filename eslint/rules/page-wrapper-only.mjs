const FEATURES_COMPONENT_IMPORT_PATTERN = /^@\/features\/.+\/components\/.+-page-content$/;
const ALLOWED_CONFIG_EXPORTS = new Set([
  "metadata",
  "viewport",
  "revalidate",
  "dynamic",
  "dynamicParams",
  "fetchCache",
  "preferredRegion",
  "runtime",
  "maxDuration",
]);
const ALLOWED_FUNCTION_EXPORTS = new Set(["generateMetadata", "generateViewport"]);

function isTypeOnlyImport(specifier) {
  return specifier.type === "ImportSpecifier" && specifier.importKind === "type";
}

function isAllowedNextImport(node) {
  return (
    node.source.value === "next" &&
    (node.importKind === "type" || node.specifiers.every(isTypeOnlyImport))
  );
}

function isAllowedNamedExport(node) {
  if (node.type !== "ExportNamedDeclaration" || node.specifiers.length > 0 || node.source) {
    return false;
  }

  if (!node.declaration) {
    return false;
  }

  if (node.declaration.type === "VariableDeclaration") {
    return (
      node.declaration.kind === "const" &&
      node.declaration.declarations.length === 1 &&
      node.declaration.declarations[0].id.type === "Identifier" &&
      ALLOWED_CONFIG_EXPORTS.has(node.declaration.declarations[0].id.name)
    );
  }

  if (node.declaration.type === "FunctionDeclaration") {
    return (
      node.declaration.id?.type === "Identifier" &&
      ALLOWED_FUNCTION_EXPORTS.has(node.declaration.id.name)
    );
  }

  return false;
}

function isImportedPageContent(node, importedName) {
  return (
    node?.type === "JSXElement" &&
    node.openingElement.name.type === "JSXIdentifier" &&
    node.openingElement.name.name === importedName &&
    node.openingElement.attributes.length === 0 &&
    node.children.length === 0 &&
    (node.openingElement.selfClosing ||
      (node.closingElement?.name.type === "JSXIdentifier" &&
        node.closingElement.name.name === importedName))
  );
}

export const pageWrapperOnlyRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce thin Next.js route pages that only render a page-content component from features.",
    },
    schema: [],
    messages: {
      importCount: "`app/**/page.tsx` must import exactly one page-content component from features.",
      importShape:
        "`app/**/page.tsx` must use a named import from `@/features/**/components/**-page-content`.",
      importExtras:
        "`app/**/page.tsx` only allows the page-content import plus optional type-only imports from `next`.",
      bodyShape:
        "`app/**/page.tsx` may only contain allowed imports, optional Next.js page exports, and one default-exported page wrapper.",
      exportShape:
        "`app/**/page.tsx` must default export a function declaration with no parameters.",
      functionBody:
        "The default page function must only return the imported page-content component.",
    },
  },
  create(context) {
    return {
      Program(node) {
        const imports = node.body.filter((statement) => statement.type === "ImportDeclaration");
        const featureImports = imports.filter((statement) =>
          FEATURES_COMPONENT_IMPORT_PATTERN.test(statement.source.value)
        );
        const exportDefaults = node.body.filter(
          (statement) => statement.type === "ExportDefaultDeclaration"
        );

        if (featureImports.length !== 1) {
          context.report({ node, messageId: "importCount" });
          return;
        }

        const [pageImport] = featureImports;

        if (
          pageImport.specifiers.length !== 1 ||
          pageImport.specifiers[0].type !== "ImportSpecifier"
        ) {
          context.report({ node: pageImport, messageId: "importShape" });
          return;
        }

        const hasOnlyAllowedImports = imports.every(
          (statement) => statement === pageImport || isAllowedNextImport(statement)
        );

        if (!hasOnlyAllowedImports) {
          context.report({ node, messageId: "importExtras" });
          return;
        }

        const importedName = pageImport.specifiers[0].local.name;
        const nonImportStatements = node.body.filter((statement) => statement.type !== "ImportDeclaration");
        const hasOnlyAllowedStatements = nonImportStatements.every(
          (statement) =>
            statement.type === "ExportDefaultDeclaration" || isAllowedNamedExport(statement)
        );

        if (
          exportDefaults.length !== 1 ||
          !hasOnlyAllowedStatements
        ) {
          context.report({ node, messageId: "bodyShape" });
          return;
        }

        const exportDefault = exportDefaults[0];
        const declaration = exportDefault.declaration;

        if (
          declaration?.type !== "FunctionDeclaration" ||
          declaration.params.length !== 0 ||
          declaration.async ||
          declaration.generator
        ) {
          context.report({ node: exportDefault, messageId: "exportShape" });
          return;
        }

        const statements = declaration.body.body;

        if (
          statements.length !== 1 ||
          statements[0].type !== "ReturnStatement" ||
          !isImportedPageContent(statements[0].argument, importedName)
        ) {
          context.report({ node: declaration.body, messageId: "functionBody" });
        }
      },
    };
  },
};
