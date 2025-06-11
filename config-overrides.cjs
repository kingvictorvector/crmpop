const path = require('path');

module.exports = function override(config, env) {
  // Prevent looking in parent directories
  config.context = __dirname;
  config.resolve.roots = [__dirname];
  config.resolveLoader.roots = [__dirname];
  
  // Set modules paths explicitly
  config.resolve.modules = [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, 'src')
  ];
  config.resolveLoader.modules = [path.resolve(__dirname, 'node_modules')];

  // Disable cosmiconfig's parent directory search
  process.env.COSMICONFIG_DISABLE_PARENT_SEARCH = 'true';
  
  return config;
}; 