import reportWebVitals from './reportWebVitals';

// Mock the web-vitals module
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn()
}));

describe('reportWebVitals', () => {
  test('does not call web-vitals when onPerfEntry is not a function', () => {
    // Call reportWebVitals with null
    reportWebVitals(null);
    
    // Import should not be called
    expect(require('web-vitals').getCLS).not.toHaveBeenCalled();
    expect(require('web-vitals').getFID).not.toHaveBeenCalled();
    expect(require('web-vitals').getFCP).not.toHaveBeenCalled();
    expect(require('web-vitals').getLCP).not.toHaveBeenCalled();
    expect(require('web-vitals').getTTFB).not.toHaveBeenCalled();
  });
  
  test('calls web-vitals functions when onPerfEntry is a function', async () => {
    // Create a mock function
    const mockPerfEntry = jest.fn();
    
    // Call reportWebVitals with the mock function
    reportWebVitals(mockPerfEntry);
    
    // Wait for the import promise to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // All web-vitals functions should be called with the mock function
    expect(require('web-vitals').getCLS).toHaveBeenCalledWith(mockPerfEntry);
    expect(require('web-vitals').getFID).toHaveBeenCalledWith(mockPerfEntry);
    expect(require('web-vitals').getFCP).toHaveBeenCalledWith(mockPerfEntry);
    expect(require('web-vitals').getLCP).toHaveBeenCalledWith(mockPerfEntry);
    expect(require('web-vitals').getTTFB).toHaveBeenCalledWith(mockPerfEntry);
  });
});
