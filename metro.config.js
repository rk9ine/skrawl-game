// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for Supabase WebSocket issue in React Native
// Disable package exports to prevent ws module import issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
