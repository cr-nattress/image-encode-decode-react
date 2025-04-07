import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock the services to avoid actual canvas operations
jest.mock('./services/imageService', () => ({
  dataURLToImage: jest.fn(() => Promise.resolve({})),
  lsbEncode: jest.fn(() => Promise.resolve('data:image/png;base64,encoded')),
  lsbDecode: jest.fn(() => new Uint8Array([72, 101, 108, 108, 111])) // "Hello"
}));

jest.mock('./services/cryptoService', () => ({
  encrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(10))),
  decrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(10))),
  hasEncryptionMetadata: jest.fn(() => true)
}));

// Mock FileReader
class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }
  
  readAsDataURL() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'data:image/png;base64,test' } });
      }
    }, 0);
  }
}

global.FileReader = MockFileReader;

// Mock TextEncoder/TextDecoder
global.TextEncoder = jest.fn(() => ({
  encode: jest.fn(() => new Uint8Array([1, 2, 3]))
}));

global.TextDecoder = jest.fn(() => ({
  decode: jest.fn(() => 'decoded text')
}));

describe('App component', () => {
  test('renders the application title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Image Steganography Tool/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders encode/decode mode buttons', () => {
    render(<App />);
    const encodeButton = screen.getByRole('button', { name: /^Encode$/i });
    const decodeButton = screen.getByRole('button', { name: /^Decode$/i });
    expect(encodeButton).toBeInTheDocument();
    expect(decodeButton).toBeInTheDocument();
  });

  test('starts in encode mode by default', () => {
    render(<App />);
    const textareaElement = screen.getByPlaceholderText(/Enter text to hide in the image/i);
    expect(textareaElement).toBeInTheDocument();
  });

  test('switches to decode mode when clicking the decode button', () => {
    render(<App />);
    const decodeButton = screen.getByRole('button', { name: /^Decode$/i });
    fireEvent.click(decodeButton);
    
    const imageUploadHeader = screen.getByText(/Image to Decode/i);
    expect(imageUploadHeader).toBeInTheDocument();
  });

  test('shows password input when encryption is enabled', () => {
    render(<App />);
    const encryptionCheckbox = screen.getByLabelText(/Use Password Protection/i);
    fireEvent.click(encryptionCheckbox);
    
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    expect(passwordInput).toBeInTheDocument();
  });

  test('encode button is disabled when text input is empty', () => {
    render(<App />);
    const encodeButton = screen.getByRole('button', { name: /^Encode$/i });
    expect(encodeButton).toBeDisabled();
  });
});
