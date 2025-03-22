module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ['module:metro-react-native-babel-preset', "babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      env: {
        production: {
          plugins: ['react-native-paper/babel'],
        }
      }
    };
  };