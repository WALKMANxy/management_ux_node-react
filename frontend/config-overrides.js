const Dotenv = require('dotenv-webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": false,
    "os": false,
    "crypto": false,
    "stream": false,
    "process": false,
  };

  config.plugins = (config.plugins || []).concat([
    new Dotenv({
      path: `./.env.${process.env.NODE_ENV}`, // Path to .env file
      systemvars: true, // Load system variables as well
    }),
  ]);

  return config;
};
