module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@core': './src/core',
            '@services': './src/services',
            '@ui': './src/ui',
            '@assets': './src/assets',
          },
        },
      ],
    ],
  };
};
