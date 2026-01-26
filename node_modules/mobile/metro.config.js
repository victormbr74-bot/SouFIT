const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sharedCore = path.resolve(projectRoot, '../packages/core/src');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [path.resolve(projectRoot, '../packages/core')];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@soufit/core': sharedCore
};

module.exports = config;
