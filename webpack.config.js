const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8081, // 更改为 8081 或其他可用端口
    historyApiFallback: true,
    onListening: function(server) {
      const port = server.server.address().port;
      const host = server.server.address().address;
      console.log(`Server is listening at http://${host}:${port}`);
    },
  },
};
