// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env", // tên module sẽ import trong code
          path: ".env", // đường dẫn file .env
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      "react-native-reanimated/plugin", // LUÔN để plugin này ở cuối
    ],
  };
};
