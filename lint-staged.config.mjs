const eslintIgnorePatterns = [
  /eslint\.config\.mjs$/,
  /lint-staged\.config\.mjs$/,
  /postcss\.config\.mjs$/,
  /[/\\]scripts[/\\]/,
];

function shouldEslint(file) {
  return !eslintIgnorePatterns.some((pattern) => pattern.test(file));
}

function quotePath(file) {
  return `"${file.replace(/"/g, '\\"')}"`;
}

/** @type {import('lint-staged').Config} */
export default {
  '*.{js,cjs,mjs,ts,tsx}': (files) => {
    const eslintTargets = files.filter(shouldEslint);
    const commands = [];

    if (eslintTargets.length > 0) {
      commands.push(`eslint --fix --max-warnings=0 ${eslintTargets.map(quotePath).join(' ')}`);
    }

    if (files.length > 0) {
      commands.push(`prettier --write ${files.map(quotePath).join(' ')}`);
    }

    return commands;
  },
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
