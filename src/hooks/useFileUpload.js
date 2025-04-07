import { useState, useCallback } from 'react';

/**
 * Custom hook for handling file uploads
 * @returns {Object} - File upload state and handlers
 */
const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileDataURL, setFileDataURL] = useState('');
  const [error, setError] = useState('');
  
  /**
   * Handles file selection
   * @param {Event} event - The file input change event
   * @param {string[]} acceptedTypes - Array of accepted MIME types
   */
  const handleFileChange = useCallback((event, acceptedTypes = ['image/']) => {
    setError('');
    
    if (!event.target.files || !event.target.files[0]) {
      return;
    }
    
    const selectedFile = event.target.files[0];
    
    // Check if file is of accepted type
    const isAcceptedType = acceptedTypes.some(type => 
      selectedFile.type.startsWith(type)
    );
    
    if (!isAcceptedType) {
      setError(`Please upload a valid file. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }
    
    setFile(selectedFile);
    
    // Create a data URL for the file
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataURL(e.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read the file');
    };
    reader.readAsDataURL(selectedFile);
  }, []);
  
  /**
   * Resets the file state
   */
  const resetFile = useCallback(() => {
    setFile(null);
    setFileDataURL('');
    setError('');
  }, []);
  
  return {
    file,
    fileDataURL,
    error,
    handleFileChange,
    resetFile
  };
};

export default useFileUpload;
