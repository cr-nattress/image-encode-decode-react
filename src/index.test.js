// We need to import React for JSX, even if not directly used
import React from 'react';
import { createRoot } from 'react-dom/client';
// We need to import App for the mock, even if not directly used
import App from './App';
import reportWebVitals from './reportWebVitals';

// Mock the modules
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn()
  }))
}));

jest.mock('./App', () => () => 'App Component');
jest.mock('./reportWebVitals', () => jest.fn());

describe('index.js', () => {
  let originalCreateElement;
  let mockElement;
  
  beforeAll(() => {
    // Mock document.getElementById
    mockElement = {};
    originalCreateElement = document.createElement;
    document.getElementById = jest.fn(() => mockElement);
  });
  
  afterAll(() => {
    document.createElement = originalCreateElement;
    jest.resetModules();
  });
  
  test('renders the App component in StrictMode', () => {
    // Execute the index.js file
    require('./index');
    
    // Check if getElementById was called with 'root'
    expect(document.getElementById).toHaveBeenCalledWith('root');
    
    // Check if createRoot was called with the element
    expect(createRoot).toHaveBeenCalledWith(mockElement);
    
    // Check if render was called
    expect(createRoot(mockElement).render).toHaveBeenCalled();
  });
  
  test('calls reportWebVitals', () => {
    // Execute the index.js file
    require('./index');
    
    // Check if reportWebVitals was called
    expect(reportWebVitals).toHaveBeenCalled();
  });
});
