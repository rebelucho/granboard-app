import nextPlugin from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".next/*", "node_modules/*", "out/*", "public/*", "coverage/*"],
  },
  ...nextPlugin,
];

export default eslintConfig;
