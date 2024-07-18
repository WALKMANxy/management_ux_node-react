const Dotenv = require('dotenv-webpack');

module.exports = {
  resolve: {
    fallback: {
      "path": false,
      "fs": false,
      "crypto": false,
      "stream": false,
      "os": false,
      "process": false,
    },
  },
  plugins: [
    new Dotenv({
      path: `./.env.${process.env.NODE_ENV}`, // Load the appropriate .env file
      systemvars: true, // Load system variables as well
    }),
  ],
};
