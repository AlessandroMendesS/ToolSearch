import 'react-native-url-polyfill/auto';
import { TextEncoder, TextDecoder } from 'text-encoding';

// Polyfills globais
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}