/**
 * Web Worker for image processing
 * This offloads heavy image processing from the main thread
 */

/* eslint-disable no-restricted-globals */

// Function to send logs back to the main thread
const sendLog = (level, message, metadata = {}) => {
  self.postMessage({
    type: 'log',
    level,
    message,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      worker: 'imageWorker'
    }
  });
};

// Image processing functions
const dataURLToImage = (dataURL) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
};

const createCanvas = (width, height) => {
  const canvas = new OffscreenCanvas(width, height);
  return canvas;
};

const drawImageOnCanvas = (image, canvas) => {
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return ctx;
};

// LSB encoding function
const lsbEncode = async (imageData, data) => {
  try {
    sendLog('info', 'Starting LSB encoding in worker', { dataSize: data.length });
    
    // Create an image from the data URL
    const coverImage = await dataURLToImage(imageData);
    sendLog('info', 'Image loaded in worker', { width: coverImage.width, height: coverImage.height });
    
    // Create a canvas and draw the cover image on it
    const canvas = createCanvas(coverImage.width, coverImage.height);
    const ctx = drawImageOnCanvas(coverImage, canvas);
    
    // Get the cover image data
    const coverImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const coverData = coverImageData.data;
    
    // Calculate the maximum number of bytes that can be embedded
    const maxBytes = Math.floor((canvas.width * canvas.height * 3) / 8) - 4;
    
    // Check if the data will fit in the image
    if (data.length > maxBytes) {
      const errorMsg = `Message too large! Maximum size is ${maxBytes} bytes, but your message is ${data.length} bytes.`;
      sendLog('error', errorMsg, { maxBytes, dataLength: data.length });
      throw new Error(errorMsg);
    }
    
    sendLog('info', 'Preparing data for encoding', { maxBytes, dataLength: data.length });
    
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
    
    sendLog('info', 'Embedding data into image', { bitsCount: messageBits.length });
    
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
    
    sendLog('info', 'Creating result image');
    
    // Create a new ImageData object with the modified pixel data
    const resultImageData = new ImageData(resultData, canvas.width, canvas.height);
    
    // Put the modified image data onto the canvas
    ctx.putImageData(resultImageData, 0, 0);
    
    // Convert to blob and then to data URL
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        sendLog('info', 'LSB encoding completed successfully');
        resolve(reader.result);
      };
      reader.onerror = () => {
        const errorMsg = 'Failed to convert blob to data URL';
        sendLog('error', errorMsg);
        reject(new Error(errorMsg));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    sendLog('error', `Encoding error: ${error.message}`, { stack: error.stack });
    throw new Error(`Encoding error: ${error.message}`);
  }
};

// LSB decoding function
const lsbDecode = async (imageData) => {
  try {
    sendLog('info', 'Starting LSB decoding in worker');
    
    // Create an image from the data URL
    const stegoImage = await dataURLToImage(imageData);
    sendLog('info', 'Image loaded in worker', { width: stegoImage.width, height: stegoImage.height });
    
    // Create a canvas and draw the stego image on it
    const canvas = createCanvas(stegoImage.width, stegoImage.height);
    const ctx = drawImageOnCanvas(stegoImage, canvas);
    
    // Get the image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    sendLog('info', 'Extracting hidden bits from image');
    
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
    
    sendLog('info', 'Extracting message length', { bitsExtracted: extractedBits.length });
    
    // First, extract the message length (first 32 bits = 4 bytes)
    let messageLength = 0;
    for (let i = 0; i < 32; i++) {
      messageLength = (messageLength << 1) | extractedBits[i];
    }
    
    // Check if the message length is valid
    const maxPossibleLength = Math.floor((stegoImage.width * stegoImage.height * 3) / 8) - 4;
    if (messageLength <= 0 || messageLength > maxPossibleLength) {
      const errorMsg = 'No valid hidden message found in this image';
      sendLog('error', errorMsg, { detectedLength: messageLength, maxPossibleLength });
      throw new Error(errorMsg);
    }
    
    sendLog('info', 'Extracting message content', { messageLength });
    
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
    
    sendLog('info', 'LSB decoding completed successfully', { bytesExtracted: extractedBytes.length });
    return extractedBytes;
  } catch (error) {
    sendLog('error', `Decoding error: ${error.message}`, { stack: error.stack });
    throw new Error(`Decoding error: ${error.message}`);
  }
};

// Handle messages from the main thread
self.addEventListener('message', async (event) => {
  try {
    const { type, imageData, data } = event.data;
    
    if (type === 'encode') {
      sendLog('info', 'Received encode request');
      const result = await lsbEncode(imageData, data);
      self.postMessage({ type: 'encode-result', result });
    } else if (type === 'decode') {
      sendLog('info', 'Received decode request');
      const result = await lsbDecode(imageData);
      self.postMessage({ type: 'decode-result', result });
    }
  } catch (error) {
    sendLog('error', 'Worker operation failed', { error: error.message, stack: error.stack });
    self.postMessage({ type: 'error', error: error.message });
  }
});
