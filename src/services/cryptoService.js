/**
 * Crypto utility service for AES-GCM encryption/decryption
 */

const SALT_LENGTH = 16; // 16 bytes salt
const IV_LENGTH = 12; // 12 bytes IV
const ITERATIONS = 100000; // 100,000 iterations for PBKDF2
const KEY_LENGTH = 256; // 256-bit key

/**
 * Checks if the data has encryption metadata (salt and IV)
 * @param {ArrayBuffer} data - The data to check
 * @returns {boolean} - True if the data has encryption metadata
 */
const hasEncryptionMetadata = (data) => {
  // Data should be at least SALT_LENGTH + IV_LENGTH bytes long
  return data.byteLength >= SALT_LENGTH + IV_LENGTH;
};

/**
 * Derives a key from a password using PBKDF2
 * @param {string} password - The password to derive the key from
 * @param {Uint8Array} salt - The salt to use for key derivation
 * @returns {Promise<CryptoKey>} - The derived key
 */
const deriveKey = async (password, salt) => {
  // Convert password to a key material
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import the password as a key
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive a key using PBKDF2
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypts text using AES-GCM with a password
 * @param {string} text - The text to encrypt
 * @param {string} password - The password to use for encryption
 * @returns {Promise<ArrayBuffer>} - The encrypted data (salt + IV + ciphertext)
 */
const encrypt = async (text, password) => {
  // Generate a random salt and IV
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Derive a key from the password
  const key = await deriveKey(password, salt);
  
  // Convert text to bytes
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(text);
  
  // Encrypt the data
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBuffer
  );
  
  // Combine salt + IV + ciphertext into a single buffer
  const result = new Uint8Array(salt.byteLength + iv.byteLength + encryptedData.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.byteLength);
  result.set(new Uint8Array(encryptedData), salt.byteLength + iv.byteLength);
  
  return result.buffer;
};

/**
 * Decrypts data using AES-GCM with a password
 * @param {ArrayBuffer} data - The data to decrypt (salt + IV + ciphertext)
 * @param {string} password - The password to use for decryption
 * @returns {Promise<ArrayBuffer>} - The decrypted data
 */
const decrypt = async (data, password) => {
  // Extract salt, IV, and ciphertext from the data
  const dataView = new Uint8Array(data);
  const salt = dataView.slice(0, SALT_LENGTH);
  const iv = dataView.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = dataView.slice(SALT_LENGTH + IV_LENGTH);
  
  // Derive a key from the password
  const key = await deriveKey(password, salt);
  
  // Decrypt the data
  const decryptedData = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );
  
  return decryptedData;
};

const cryptoService = {
  encrypt,
  decrypt,
  hasEncryptionMetadata
};

export default cryptoService;
