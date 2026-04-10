import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import { pageWrapperOnlyRule } from "./eslint/rules/page-wrapper-only.mjs";

const routeWrapperPlugin = {
  rules: {
    "page-wrapper-only": pageWrapperOnlyRule,
  },
};

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    files: ["app/**/page.tsx"],
    plugins: {
      "route-wrapper": routeWrapperPlugin,
    },
    rules: {
      "route-wrapper/page-wrapper-only": "error",
    },
  },
];

export default eslintConfig;
