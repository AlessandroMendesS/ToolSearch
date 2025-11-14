// Mock do WebSocket para React Native
export default class WebSocketMock {
    constructor(url) {
      return new WebSocket(url);
    }
  }
  
  // Para compatibilidade com diferentes formas de import
  module.exports = WebSocketMock;
  module.exports.default = WebSocketMock;