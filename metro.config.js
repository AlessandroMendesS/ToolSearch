const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignorar módulos problemáticos
config.resolver.blockList = [
  /node_modules\/ws\/lib\/stream\.js$/,
];

// Configurar aliases para módulos Node.js
config.resolver.alias = {
  ...config.resolver.alias,
  'stream': require.resolve('stream-browserify'),
  'ws': require.resolve('./ws-mock.js'), // Vamos criar este arquivo
};

// Configurar plataformas
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;