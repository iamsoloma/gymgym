const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  // Add any custom configuration here
};

module.exports = mergeConfig(defaultConfig, config);
