import cryptoService from './cryptoService';

describe('cryptoService', () => {
  // Mock crypto.subtle API
  const originalCrypto = global.crypto;
  
  beforeEach(() => {
    // Setup crypto mock
    const mockSubtle = {
      importKey: jest.fn(),
      deriveKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn()
    };
    
    global.crypto = {
      subtle: mockSubtle,
      getRandomValues: jest.fn(arr => {
        // Fill array with predictable values for testing
        for (let i = 0; i < arr.length; i++) {
          arr[i] = i % 256;
        }
        return arr;
      })
    };
  });
  
  afterEach(() => {
    // Restore original crypto
    global.crypto = originalCrypto;
  });
  
  describe('hasEncryptionMetadata', () => {
    test('returns true when data has enough bytes for metadata', () => {
      // Create a buffer with enough bytes for salt (16) + IV (12)
      const data = new ArrayBuffer(30);
      
      const result = cryptoService.hasEncryptionMetadata(data);
      
      expect(result).toBe(true);
    });
    
    test('returns false when data does not have enough bytes for metadata', () => {
      // Create a buffer with not enough bytes
      const data = new ArrayBuffer(20);
      
      const result = cryptoService.hasEncryptionMetadata(data);
      
      expect(result).toBe(false);
    });
  });
  
  describe('encrypt', () => {
    test('encrypts text using AES-GCM', async () => {
      // Mock TextEncoder
      const mockEncoder = {
        encode: jest.fn(() => new Uint8Array([1, 2, 3]))
      };
      global.TextEncoder = jest.fn(() => mockEncoder);
      
      // Mock crypto.subtle.importKey
      crypto.subtle.importKey.mockResolvedValue('password-key');
      
      // Mock crypto.subtle.deriveKey
      crypto.subtle.deriveKey.mockResolvedValue('derived-key');
      
      // Mock crypto.subtle.encrypt
      const mockEncryptedData = new ArrayBuffer(10);
      crypto.subtle.encrypt.mockResolvedValue(mockEncryptedData);
      
      // Call encrypt
      const result = await cryptoService.encrypt('test-text', 'test-password');
      
      // Verify crypto methods were called correctly
      expect(crypto.getRandomValues).toHaveBeenCalledTimes(2); // Once for salt, once for IV
      expect(crypto.subtle.importKey).toHaveBeenCalledWith(
        'raw',
        expect.any(Uint8Array),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      expect(crypto.subtle.deriveKey).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'PBKDF2',
          salt: expect.any(Uint8Array),
          iterations: expect.any(Number),
          hash: 'SHA-256'
        }),
        'password-key',
        expect.objectContaining({
          name: 'AES-GCM',
          length: expect.any(Number)
        }),
        false,
        ['encrypt', 'decrypt']
      );
      expect(crypto.subtle.encrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'AES-GCM',
          iv: expect.any(Uint8Array)
        }),
        'derived-key',
        expect.any(Uint8Array)
      );
      
      // Verify result is an ArrayBuffer
      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });
  
  describe('decrypt', () => {
    test('decrypts data using AES-GCM', async () => {
      // Create mock encrypted data with salt + IV + ciphertext
      const mockData = new ArrayBuffer(40); // 16 (salt) + 12 (IV) + 12 (ciphertext)
      
      // Mock crypto.subtle.importKey
      crypto.subtle.importKey.mockResolvedValue('password-key');
      
      // Mock crypto.subtle.deriveKey
      crypto.subtle.deriveKey.mockResolvedValue('derived-key');
      
      // Mock crypto.subtle.decrypt
      const mockDecryptedData = new ArrayBuffer(10);
      crypto.subtle.decrypt.mockResolvedValue(mockDecryptedData);
      
      // Call decrypt
      const result = await cryptoService.decrypt(mockData, 'test-password');
      
      // Verify crypto methods were called correctly
      expect(crypto.subtle.importKey).toHaveBeenCalledWith(
        'raw',
        expect.any(Uint8Array),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      expect(crypto.subtle.deriveKey).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'PBKDF2',
          salt: expect.any(Uint8Array),
          iterations: expect.any(Number),
          hash: 'SHA-256'
        }),
        'password-key',
        expect.objectContaining({
          name: 'AES-GCM',
          length: expect.any(Number)
        }),
        false,
        ['encrypt', 'decrypt']
      );
      expect(crypto.subtle.decrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'AES-GCM',
          iv: expect.any(Uint8Array)
        }),
        'derived-key',
        expect.any(Uint8Array)
      );
      
      // Verify result is the decrypted data
      expect(result).toBe(mockDecryptedData);
    });
  });
});
