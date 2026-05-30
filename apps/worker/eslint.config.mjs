import { createNestConfig } from "@gold/eslint-config/nestjs";

export default createNestConfig({
  tsconfigRootDir: import.meta.dirname,
});
