const path = require('path');

module.exports = {
  context: __dirname,
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'src')
    ],
    roots: [__dirname]
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, 'node_modules')],
    roots: [__dirname]
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeRun.tap('PreventParentLookup', () => {
          process.env.NODE_PATH = path.resolve(__dirname);
          compiler.options.resolve.roots = [__dirname];
          compiler.options.resolveLoader.roots = [__dirname];
        });
      }
    }
  ]
}; 