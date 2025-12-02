
export default class WebSocketMock {
    constructor(url) {
      return new WebSocket(url);
    }
  }
  
  module.exports = WebSocketMock;

  module.exports.default = WebSocketMock;
