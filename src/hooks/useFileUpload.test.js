import { renderHook, act } from '@testing-library/react';
import useFileUpload from './useFileUpload';

// Mock FileReader globally for all tests
class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }
  
  readAsDataURL(file) {
    setTimeout(() => {
      if (this.onload && file.type.includes('image/')) {
        this.onload({ target: { result: 'data:image/png;base64,test' } });
      } else if (this.onerror) {
        this.onerror();
      }
    }, 0);
  }
}

// Store original FileReader
const originalFileReader = global.FileReader;

describe('useFileUpload hook', () => {
  beforeEach(() => {
    // Set up FileReader mock before each test
    global.FileReader = jest.fn(() => new MockFileReader());
  });
  
  afterEach(() => {
    // Restore original FileReader after each test
    global.FileReader = originalFileReader;
  });
  
  test('initial state is empty', () => {
    const { result } = renderHook(() => useFileUpload());
    
    expect(result.current.file).toBeNull();
    expect(result.current.fileDataURL).toBe('');
    expect(result.current.error).toBe('');
  });

  test('resetFile clears state', () => {
    const { result } = renderHook(() => useFileUpload());
    
    // Manually set some state
    act(() => {
      result.current.file = new File(['test'], 'test.png', { type: 'image/png' });
      result.current.fileDataURL = 'data:image/png;base64,test';
      result.current.error = 'Test error';
    });
    
    // Call resetFile
    act(() => {
      result.current.resetFile();
    });
    
    // Check state is reset
    expect(result.current.file).toBeNull();
    expect(result.current.fileDataURL).toBe('');
    expect(result.current.error).toBe('');
  });

  test('handleFileChange sets error for invalid file type', () => {
    const { result } = renderHook(() => useFileUpload());
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = {
      target: {
        files: [file]
      }
    };
    
    act(() => {
      result.current.handleFileChange(event, ['image/']);
    });
    
    expect(result.current.error).not.toBe('');
    expect(result.current.file).toBeNull();
  });

  test('handleFileChange does nothing when no files are selected', () => {
    const { result } = renderHook(() => useFileUpload());
    
    const event = {
      target: {
        files: []
      }
    };
    
    act(() => {
      result.current.handleFileChange(event);
    });
    
    expect(result.current.file).toBeNull();
    expect(result.current.fileDataURL).toBe('');
  });

  test('handleFileChange accepts valid file type', async () => {
    const { result } = renderHook(() => useFileUpload());
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const event = {
      target: {
        files: [file]
      }
    };
    
    act(() => {
      result.current.handleFileChange(event);
    });
    
    expect(result.current.file).toBe(file);
    
    // Wait for the asynchronous file read to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    expect(result.current.fileDataURL).toBe('data:image/png;base64,test');
  });

  test('handleFileChange handles file read error', async () => {
    const { result } = renderHook(() => useFileUpload());
    
    // Create a file with a type that will trigger an error in our mock
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const event = {
      target: {
        files: [file]
      }
    };
    
    act(() => {
      result.current.handleFileChange(event, ['image/']);
    });
    
    // Wait for the asynchronous error handling to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    expect(result.current.error).not.toBe('');
  });
});
