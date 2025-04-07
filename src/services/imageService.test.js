import imageService from './imageService';

// Mock canvas and context
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(),
  toDataURL: jest.fn()
};

const mockContext = {
  drawImage: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn()
};

// Mock document.createElement
document.createElement = jest.fn(() => mockCanvas);

// Mock canvas.getContext
mockCanvas.getContext.mockReturnValue(mockContext);

describe('imageService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('dataURLToImage', () => {
    test('converts dataURL to Image object', async () => {
      // Mock Image
      const originalImage = global.Image;
      const mockImage = function() {
        this.onload = null;
        this.onerror = null;
        this.src = '';
        return this;
      };
      global.Image = mockImage;

      const dataURL = 'data:image/png;base64,test';
      const imagePromise = imageService.dataURLToImage(dataURL);
      
      // Get the image instance
      const imageInstance = await imagePromise;
      
      // Simulate onload
      imageInstance.onload();
      
      expect(imageInstance.src).toBe(dataURL);
      
      // Restore original Image
      global.Image = originalImage;
    });

    test('handles image load error', async () => {
      // Mock Image
      const originalImage = global.Image;
      const mockImage = function() {
        this.onload = null;
        this.onerror = null;
        this.src = '';
        return this;
      };
      global.Image = mockImage;

      const dataURL = 'data:image/png;base64,test';
      const imagePromise = imageService.dataURLToImage(dataURL);
      
      // Get the image instance
      const imageInstance = await imagePromise;
      
      // Expect promise to reject when onerror is called
      await expect(async () => {
        imageInstance.onerror();
        await imagePromise;
      }).rejects.toThrow('Failed to load image');
      
      // Restore original Image
      global.Image = originalImage;
    });
  });

  describe('drawImageOnCanvas', () => {
    test('draws image on canvas and returns context', () => {
      const mockImage = { width: 100, height: 100 };
      
      const ctx = imageService.drawImageOnCanvas(mockImage, mockCanvas);
      
      expect(mockCanvas.width).toBe(mockImage.width);
      expect(mockCanvas.height).toBe(mockImage.height);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0);
      expect(ctx).toBe(mockContext);
    });
  });

  describe('createCanvas', () => {
    test('creates canvas with specified dimensions', () => {
      const width = 200;
      const height = 150;
      
      const canvas = imageService.createCanvas(width, height);
      
      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(canvas.width).toBe(width);
      expect(canvas.height).toBe(height);
      expect(canvas).toBe(mockCanvas);
    });
  });

  describe('lsbEncode', () => {
    test('encodes data into image using LSB steganography', () => {
      // Mock image and canvas
      const mockImage = { width: 10, height: 10 };
      const mockImageData = {
        data: new Uint8ClampedArray(10 * 10 * 4), // 10x10 pixels, 4 bytes per pixel
        width: 10,
        height: 10
      };
      
      // Mock context.getImageData
      mockContext.getImageData.mockReturnValue(mockImageData);
      
      // Mock canvas.toDataURL
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,encoded');
      
      // Create data to encode (small enough to fit in the mock image)
      const dataToEncode = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      
      // Call lsbEncode
      const result = imageService.lsbEncode(mockImage, dataToEncode);
      
      // Verify canvas and context methods were called
      expect(document.createElement).toHaveBeenCalled();
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.getImageData).toHaveBeenCalled();
      expect(mockContext.putImageData).toHaveBeenCalled();
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      
      // Verify result
      expect(result).toBe('data:image/png;base64,encoded');
    });

    test('throws error when data is too large for image', () => {
      // Mock image and canvas
      const mockImage = { width: 2, height: 2 }; // Very small image
      const mockImageData = {
        data: new Uint8ClampedArray(2 * 2 * 4), // 2x2 pixels, 4 bytes per pixel
        width: 2,
        height: 2
      };
      
      // Mock context.getImageData
      mockContext.getImageData.mockReturnValue(mockImageData);
      
      // Create data that's too large to fit in the mock image
      const dataToEncode = new Uint8Array(new Array(100).fill(65)); // 100 bytes
      
      // Expect lsbEncode to throw an error
      expect(() => {
        imageService.lsbEncode(mockImage, dataToEncode);
      }).toThrow(/Message too large/);
    });
  });

  describe('lsbDecode', () => {
    test('decodes data from image using LSB steganography', () => {
      // Mock image and canvas
      const mockImage = { width: 10, height: 10 };
      
      // Create mock image data with encoded message
      // First 32 bits (4 bytes) represent message length = 5
      // Next 40 bits (5 bytes) represent "Hello"
      const mockImageData = {
        data: new Uint8ClampedArray(10 * 10 * 4), // 10x10 pixels, 4 bytes per pixel
        width: 10,
        height: 10
      };
      
      // Set LSB of first 32 pixels to represent length = 5 (00000000 00000000 00000000 00000101)
      for (let i = 0; i < 32; i++) {
        const pixelIndex = i * 4;
        mockImageData.data[pixelIndex] = (i === 31) ? 1 : 0; // Only last bit is 1
      }
      
      // Set LSB of next 40 pixels to represent "Hello"
      // H (01001000) - 8 bits starting from pixel 32
      // e (01100101) - 8 bits starting from pixel 40
      // l (01101100) - 8 bits starting from pixel 48
      // l (01101100) - 8 bits starting from pixel 56
      // o (01101111) - 8 bits starting from pixel 64
      
      // Mock context.getImageData
      mockContext.getImageData.mockReturnValue(mockImageData);
      
      // Call lsbDecode
      const result = imageService.lsbDecode(mockImage);
      
      // Verify canvas and context methods were called
      expect(document.createElement).toHaveBeenCalled();
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.getImageData).toHaveBeenCalled();
      
      // Verify result is a Uint8Array
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(5); // Length should be 5 as encoded in the mock data
    });

    test('throws error when no valid message is found', () => {
      // Mock image and canvas
      const mockImage = { width: 10, height: 10 };
      
      // Create mock image data with invalid message length
      const mockImageData = {
        data: new Uint8ClampedArray(10 * 10 * 4), // 10x10 pixels, 4 bytes per pixel
        width: 10,
        height: 10
      };
      
      // Set all bits to 1 to create an impossibly large message length
      for (let i = 0; i < mockImageData.data.length; i++) {
        mockImageData.data[i] = 255;
      }
      
      // Mock context.getImageData
      mockContext.getImageData.mockReturnValue(mockImageData);
      
      // Expect lsbDecode to throw an error
      expect(() => {
        imageService.lsbDecode(mockImage);
      }).toThrow(/No valid hidden message found/);
    });
  });
});
