/**
 * Image utility service for handling image operations
 */

import loggingService from './loggingService';

/**
 * Converts a data URL to an Image object
 * @param {string} dataURL - The data URL to convert
 * @returns {Promise<HTMLImageElement>} - A promise that resolves to an Image object
 */
const dataURLToImage = (dataURL) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
};

/**
 * Draws an image on a canvas and returns the context
 * @param {HTMLImageElement} image - The image to draw
 * @param {HTMLCanvasElement} canvas - The canvas to draw on
 * @returns {CanvasRenderingContext2D} - The canvas context
 */
const drawImageOnCanvas = (image, canvas) => {
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return ctx;
};

/**
 * Creates a canvas element with the given width and height
 * @param {number} width - The width of the canvas
 * @param {number} height - The height of the canvas
 * @returns {HTMLCanvasElement} - The created canvas element
 */
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Check if Web Workers are supported
const isWorkerSupported = typeof Worker !== 'undefined';

// Create a worker instance if supported
let imageWorker = null;

if (isWorkerSupported) {
  try {
    imageWorker = new Worker(new URL('../workers/imageWorker.js', import.meta.url));
    loggingService.info('Image worker initialized successfully');
    
    // Set up worker message handler
    imageWorker.onmessage = (event) => {
      // Handle logs from the worker
      if (event.data.type === 'log') {
        const { level, message, metadata } = event.data;
        loggingService[level](message, { ...metadata, source: 'worker' });
      }
      // Other message types are handled by the specific promise resolvers
    };
    
    imageWorker.onerror = (error) => {
      loggingService.error('Image worker error', { error: error.message });
    };
  } catch (error) {
    loggingService.error('Failed to initialize image worker', { error: error.message });
    imageWorker = null;
  }
}

/**
 * Embeds data into an image using LSB steganography via Web Worker
 * @param {HTMLImageElement} coverImage - The cover image
 * @param {Uint8Array} data - The data to embed
 * @returns {Promise<string>} - A promise that resolves to a data URL
 */
const lsbEncode = async (coverImage, data) => {
  loggingService.info('Starting LSB encoding', { dataSize: data.length });
  
  // If image is passed directly, use it, otherwise convert from data URL
  let img = coverImage;
  let imageDataURL;
  
  if (typeof coverImage === 'string') {
    img = await dataURLToImage(coverImage);
    imageDataURL = coverImage;
  } else {
    // Create a data URL from the image if it's an HTMLImageElement
    const tempCanvas = createCanvas(img.width, img.height);
    // We need to draw the image but don't need to use the context return value
    // eslint-disable-next-line no-unused-vars
    const tempCtx = drawImageOnCanvas(img, tempCanvas);
    imageDataURL = tempCanvas.toDataURL('image/png');
  }
  
  loggingService.info('Cover image prepared', { width: img.width, height: img.height });
  
  // Use Web Worker if available
  if (imageWorker) {
    loggingService.info('Using Web Worker for encoding');
    return new Promise((resolve, reject) => {
      const messageHandler = (event) => {
        const { type, result, error } = event.data;
        
        if (type === 'encode-result') {
          imageWorker.removeEventListener('message', messageHandler);
          loggingService.info('Encoding completed in worker');
          resolve(result);
        } else if (type === 'error') {
          imageWorker.removeEventListener('message', messageHandler);
          loggingService.error('Worker encoding error', { error });
          reject(new Error(error));
        }
        // Ignore log messages as they're handled by the main handler
      };
      
      imageWorker.addEventListener('message', messageHandler);
      imageWorker.postMessage({ type: 'encode', imageData: imageDataURL, data });
    });
  } else {
    // Fallback to main thread processing
    loggingService.warn('Web Worker not available, falling back to main thread for encoding');
    
    try {
      // Create a canvas and draw the cover image on it
      const canvas = createCanvas(img.width, img.height);
      const ctx = drawImageOnCanvas(img, canvas);
      
      // Get the cover image data
      const coverImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const coverData = coverImageData.data;
      
      // Calculate the maximum number of bytes that can be embedded
      const maxBytes = Math.floor((canvas.width * canvas.height * 3) / 8) - 4;
      
      // Check if the data will fit in the image
      if (data.length > maxBytes) {
        const errorMsg = `Message too large! Maximum size is ${maxBytes} bytes, but your message is ${data.length} bytes.`;
        loggingService.error(errorMsg, { maxBytes, dataSize: data.length });
        throw new Error(errorMsg);
      }
      
      loggingService.info('Preparing data for encoding', { maxBytes, dataSize: data.length });
      
      // Create a new array that includes the message length (32-bit integer) followed by the message
      const messageLength = data.length;
      const fullMessage = new Uint8Array(4 + messageLength);
      
      // Store message length as the first 4 bytes (32-bit integer)
      fullMessage[0] = (messageLength >> 24) & 0xFF; // Most significant byte
      fullMessage[1] = (messageLength >> 16) & 0xFF;
      fullMessage[2] = (messageLength >> 8) & 0xFF;
      fullMessage[3] = messageLength & 0xFF; // Least significant byte
      
      // Copy the message bytes after the length
      fullMessage.set(data, 4);
      
      // Convert the bytes to bits for LSB encoding
      const messageBits = [];
      for (let i = 0; i < fullMessage.length; i++) {
        for (let bit = 7; bit >= 0; bit--) {
          // Extract each bit from the byte
          messageBits.push((fullMessage[i] >> bit) & 1);
        }
      }
      
      loggingService.info('Embedding data into image', { bitsCount: messageBits.length });
      
      // Embed the message bits into the LSBs of the cover image
      let bitIndex = 0;
      
      // Create a copy of the cover image data for the result
      const resultData = new Uint8ClampedArray(coverData);
      
      // Embed the message bits into the LSBs of the RGB channels
      for (let i = 0; i < resultData.length - 4 && bitIndex < messageBits.length; i += 4) {
        // Modify the least significant bit of each RGB channel
        if (bitIndex < messageBits.length) {
          // Red channel
          resultData[i] = (resultData[i] & 0xFE) | messageBits[bitIndex++];
        }
        
        if (bitIndex < messageBits.length) {
          // Green channel
          resultData[i + 1] = (resultData[i + 1] & 0xFE) | messageBits[bitIndex++];
        }
        
        if (bitIndex < messageBits.length) {
          // Blue channel
          resultData[i + 2] = (resultData[i + 2] & 0xFE) | messageBits[bitIndex++];
        }
        
        // Alpha channel remains unchanged
      }
      
      // Create a new ImageData object with the modified pixel data
      const resultImageData = new ImageData(resultData, canvas.width, canvas.height);
      
      // Put the modified image data onto the canvas
      ctx.putImageData(resultImageData, 0, 0);
      
      // Convert the canvas to a data URL
      const encodedImageUrl = canvas.toDataURL('image/png');
      
      loggingService.info('LSB encoding completed successfully');
      return encodedImageUrl;
    } catch (error) {
      loggingService.error('LSB encoding failed', { error: error.message });
      throw error;
    }
  }
};

/**
 * Extracts data from an image using LSB steganography via Web Worker
 * @param {HTMLImageElement} stegoImage - The steganographic image
 * @returns {Promise<Uint8Array>} - A promise that resolves to the extracted data
 */
const lsbDecode = async (stegoImage) => {
  loggingService.info('Starting LSB decoding');
  
  // If image is passed directly, use it, otherwise convert from data URL
  let img = stegoImage;
  let imageDataURL;
  
  if (typeof stegoImage === 'string') {
    img = await dataURLToImage(stegoImage);
    imageDataURL = stegoImage;
  } else {
    // Create a data URL from the image if it's an HTMLImageElement
    const tempCanvas = createCanvas(img.width, img.height);
    // We need to draw the image but don't need to use the context return value
    // eslint-disable-next-line no-unused-vars
    const tempCtx = drawImageOnCanvas(img, tempCanvas);
    imageDataURL = tempCanvas.toDataURL('image/png');
  }
  
  loggingService.info('Stego image prepared', { width: img.width, height: img.height });
  
  // Use Web Worker if available
  if (imageWorker) {
    loggingService.info('Using Web Worker for decoding');
    return new Promise((resolve, reject) => {
      const messageHandler = (event) => {
        const { type, result, error } = event.data;
        
        if (type === 'decode-result') {
          imageWorker.removeEventListener('message', messageHandler);
          loggingService.info('Decoding completed in worker', { dataSize: result.length });
          resolve(result);
        } else if (type === 'error') {
          imageWorker.removeEventListener('message', messageHandler);
          loggingService.error('Worker decoding error', { error });
          reject(new Error(error));
        }
        // Ignore log messages as they're handled by the main handler
      };
      
      imageWorker.addEventListener('message', messageHandler);
      imageWorker.postMessage({ type: 'decode', imageData: imageDataURL });
    });
  } else {
    // Fallback to main thread processing
    loggingService.warn('Web Worker not available, falling back to main thread for decoding');
    
    try {
      // Create a canvas and draw the stego image on it
      const canvas = createCanvas(img.width, img.height);
      const ctx = drawImageOnCanvas(img, canvas);
      
      // Get the image data
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      loggingService.info('Extracting hidden bits from image');
      
      // Extract the LSB from each RGB channel to get the hidden bits
      const extractedBits = [];
      for (let i = 0; i < data.length; i += 4) {
        // Extract LSB from Red channel
        extractedBits.push(data[i] & 1);
        // Extract LSB from Green channel
        extractedBits.push(data[i + 1] & 1);
        // Extract LSB from Blue channel
        extractedBits.push(data[i + 2] & 1);
        // Ignore Alpha channel
      }
      
      loggingService.info('Extracting message length', { bitsExtracted: extractedBits.length });
      
      // First, extract the message length (first 32 bits = 4 bytes)
      let messageLength = 0;
      for (let i = 0; i < 32; i++) {
        messageLength = (messageLength << 1) | extractedBits[i];
      }
      
      // Check if the message length is valid
      const maxPossibleLength = Math.floor((img.width * img.height * 3) / 8) - 4;
      if (messageLength <= 0 || messageLength > maxPossibleLength) {
        const errorMsg = 'No valid hidden message found in this image';
        loggingService.error(errorMsg, { detectedLength: messageLength, maxPossibleLength });
        throw new Error(errorMsg);
      }
      
      loggingService.info('Extracting message content', { messageLength });
      
      // Convert bits to bytes (starting after the length bits)
      const extractedBytes = new Uint8Array(messageLength);
      for (let i = 0; i < messageLength; i++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const bitIndex = 32 + (i * 8) + bit; // 32 bits for length + current bit position
          if (bitIndex < extractedBits.length) {
            byte = (byte << 1) | extractedBits[bitIndex];
          }
        }
        extractedBytes[i] = byte;
      }
      
      loggingService.info('LSB decoding completed successfully', { bytesExtracted: extractedBytes.length });
      return extractedBytes;
    } catch (error) {
      loggingService.error('LSB decoding failed', { error: error.message });
      throw error;
    }
  }
};

const imageService = {
  dataURLToImage,
  drawImageOnCanvas,
  createCanvas,
  lsbEncode,
  lsbDecode
};

export default imageService;
