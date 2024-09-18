module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    "nativewind/babel",
    "react-native-paper/babel",
    "react-native-reanimated/plugin",
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ],
  ],
};
