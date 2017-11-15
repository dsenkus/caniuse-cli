// if fails use `npm link npm` in caniuse-cli folder
const npm = require('npm');
const packageJson = require('./package.json');

const version = packageJson.dependencies['caniuse-db'].substr(1);

npm.load(() => {
  npm.commands.version([version]);
});
