import React, { useState, useEffect } from 'react';
import './styles/main.scss';
import useFileUpload from './hooks/useFileUpload';
import imageService from './services/imageService';
import cryptoService from './services/cryptoService';
import loggingService from './services/loggingService';
import ShadcnDemo from './components/ShadcnDemo';
import { Button } from './components/ui/button';

function App() {
  // State for encode/decode mode
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  
  // State for text input/output
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  
  // State for password protection
  const [useEncryption, setUseEncryption] = useState(false);
  const [password, setPassword] = useState('');
  
  // State for processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // File upload hooks
  const coverImageUpload = useFileUpload();
  const stegoImageUpload = useFileUpload();
  
  // State for result image
  const [resultImageUrl, setResultImageUrl] = useState('');
  
  // State for showing shadcn demo
  const [showShadcnDemo, setShowShadcnDemo] = useState(false);

  // Log component mount
  useEffect(() => {
    loggingService.info('Application initialized', { initialMode: mode });
    
    // Log when component unmounts
    return () => {
      loggingService.info('Application closed');
    };
  }, [mode]);

  // Effect to reset state when mode changes
  useEffect(() => {
    // Call resetAllState function when mode changes
    const resetState = () => {
      // Reset text inputs/outputs
      setInputText('');
      setOutputText('');
      
      // Reset password fields
      setUseEncryption(false);
      setPassword('');
      
      // Reset status messages
      setError('');
      setSuccess('');
      
      // Reset processing state
      setIsProcessing(false);
      
      // Reset result image
      setResultImageUrl('');
      
      // Reset file uploads
      coverImageUpload.resetFile();
      stegoImageUpload.resetFile();
    };
    
    resetState();
    loggingService.info('Mode changed', { mode });
  }, [mode, coverImageUpload, stegoImageUpload]); // Include all dependencies

  // Handle mode change
  const handleModeChange = (newMode) => {
    loggingService.logUserAction('Changed mode', { from: mode, to: newMode });
    setMode(newMode);
  };

  // Handle encryption toggle
  const handleEncryptionToggle = (value) => {
    loggingService.logUserAction('Toggled encryption', { enabled: value });
    setUseEncryption(value);
  };

  // Handle text input change
  const handleTextChange = (text) => {
    setInputText(text);
    // Only log that text was entered, not the actual text for privacy
    if (text.length > 0 && inputText.length === 0) {
      loggingService.info('User entered text', { charCount: text.length });
    }
  };

  // Handle password change
  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
    // Only log that password was entered, not the actual password
    if (newPassword.length > 0 && password.length === 0) {
      loggingService.info('User entered password', { hasPassword: true });
    }
  };
  
  // Handle encoding
  const handleEncode = async () => {
    setError('');
    setSuccess('');
    setResultImageUrl('');
    
    loggingService.logUserAction('Started encoding process');
    
    try {
      setIsProcessing(true);
      
      if (!inputText) {
        const errorMsg = 'Please enter text to encode';
        loggingService.warn(errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!coverImageUpload.fileDataURL) {
        const errorMsg = 'Please upload a cover image';
        loggingService.warn(errorMsg);
        throw new Error(errorMsg);
      }
      
      loggingService.info('Processing image for encoding', {
        hasEncryption: useEncryption,
        textLength: inputText.length
      });
      
      // Check image size to prevent processing errors
      const img = new Image();
      img.src = coverImageUpload.fileDataURL;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      // Log image dimensions
      loggingService.info('Image loaded for encoding', {
        width: img.width,
        height: img.height,
        size: coverImageUpload.file ? coverImageUpload.file.size : 'unknown'
      });
      
      // Limit image size to prevent memory issues
      if (img.width * img.height > 4000000) { // ~4 megapixels
        const errorMsg = 'Image is too large. Please use an image smaller than 4 megapixels.';
        loggingService.warn(errorMsg, { width: img.width, height: img.height });
        throw new Error(errorMsg);
      }
      
      // Convert text to bytes
      const encoder = new TextEncoder();
      let dataToEncode;
      
      // Encrypt if needed
      if (useEncryption && password) {
        loggingService.info('Encrypting message before encoding');
        dataToEncode = await cryptoService.encrypt(inputText, password);
        dataToEncode = new Uint8Array(dataToEncode); // Ensure it's a Uint8Array
      } else {
        dataToEncode = encoder.encode(inputText);
      }
      
      // Calculate maximum message size
      const maxMessageSize = Math.floor((img.width * img.height * 3) / 8) - 4;
      if (dataToEncode.length > maxMessageSize) {
        const errorMsg = `Message too large! Maximum size is ${maxMessageSize} bytes, but your message is ${dataToEncode.length} bytes.`;
        loggingService.warn(errorMsg, { maxSize: maxMessageSize, actualSize: dataToEncode.length });
        throw new Error(errorMsg);
      }
      
      loggingService.info('Starting LSB encoding');
      
      // LSB encoding requires a cover image
      const encodedImageUrl = await imageService.lsbEncode(img, dataToEncode);
      
      loggingService.info('Encoding completed successfully');
      
      setResultImageUrl(encodedImageUrl);
      setSuccess('Message encoded successfully!');
    } catch (err) {
      console.error('Encoding error:', err);
      loggingService.error('Encoding failed', {
        error: err.message,
        stack: err.stack
      });
      setError(`${err.message}. If you're seeing "The message port closed" error, try using a smaller image or shorter message.`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle decoding
  const handleDecode = async () => {
    setError('');
    setSuccess('');
    setOutputText('');
    
    loggingService.logUserAction('Started decoding process');
    
    try {
      setIsProcessing(true);
      
      if (!stegoImageUpload.fileDataURL) {
        const errorMsg = 'Please upload an image to decode';
        loggingService.warn(errorMsg);
        throw new Error(errorMsg);
      }
      
      loggingService.info('Processing image for decoding', {
        hasEncryption: useEncryption
      });
      
      // Check image size to prevent processing errors
      const img = new Image();
      img.src = stegoImageUpload.fileDataURL;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      // Log image dimensions
      loggingService.info('Image loaded for decoding', {
        width: img.width,
        height: img.height,
        size: stegoImageUpload.file ? stegoImageUpload.file.size : 'unknown'
      });
      
      // Limit image size to prevent memory issues
      if (img.width * img.height > 4000000) { // ~4 megapixels
        const errorMsg = 'Image is too large. Please use an image smaller than 4 megapixels.';
        loggingService.warn(errorMsg, { width: img.width, height: img.height });
        throw new Error(errorMsg);
      }
      
      loggingService.info('Starting LSB decoding');
      
      // Use LSB decoding
      const decodedData = await imageService.lsbDecode(img);
      
      loggingService.info('Raw data extracted from image', { dataSize: decodedData.length });
      
      // Check if data is encrypted
      let decodedText;
      if (useEncryption && password) {
        try {
          loggingService.info('Attempting to decrypt extracted data');
          // Try to decrypt
          if (cryptoService.hasEncryptionMetadata(decodedData.buffer)) {
            const decryptedData = await cryptoService.decrypt(decodedData.buffer, password);
            const decoder = new TextDecoder();
            decodedText = decoder.decode(decryptedData);
            loggingService.info('Decryption successful');
          } else {
            const errorMsg = 'The data does not appear to be encrypted';
            loggingService.warn(errorMsg);
            throw new Error(errorMsg);
          }
        } catch (decryptErr) {
          const errorMsg = `Decryption failed: ${decryptErr.message}. Check your password.`;
          loggingService.error('Decryption failed', { error: decryptErr.message });
          throw new Error(errorMsg);
        }
      } else {
        // Assume it's plain text
        const decoder = new TextDecoder();
        decodedText = decoder.decode(decodedData);
        loggingService.info('Decoded as plain text');
      }
      
      loggingService.info('Decoding completed successfully', { textLength: decodedText.length });
      
      setOutputText(decodedText);
      setSuccess('Message decoded successfully!');
    } catch (err) {
      console.error('Decoding error:', err);
      loggingService.error('Decoding failed', {
        error: err.message,
        stack: err.stack
      });
      setError(`${err.message}. If you're seeing "The message port closed" error, try using a smaller image.`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle download of encoded image
  const handleDownload = () => {
    if (resultImageUrl) {
      loggingService.logUserAction('Downloaded encoded image');
      
      const link = document.createElement('a');
      link.href = resultImageUrl;
      link.download = `encoded-image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="app">
      <header className="app__header">
        <h1>Image Steganography Tool</h1>
        <div className="mode-selector">
          <button 
            className={`mode-selector__button ${mode === 'encode' ? 'mode-selector__button--active' : ''}`} 
            onClick={() => handleModeChange('encode')}
          >
            Encode
          </button>
          <button 
            className={`mode-selector__button ${mode === 'decode' ? 'mode-selector__button--active' : ''}`} 
            onClick={() => handleModeChange('decode')}
          >
            Decode
          </button>
        </div>
        <Button 
          className="shadcn-demo-toggle"
          onClick={() => {
            loggingService.logUserAction('Toggled Shadcn demo', { visible: !showShadcnDemo });
            setShowShadcnDemo(!showShadcnDemo);
          }}
        >
          {showShadcnDemo ? 'Hide Shadcn Demo' : 'Show Shadcn Demo'}
        </Button>
      </header>
      
      <main>
        <div className="encryption-option">
          <label className="encryption-option__label">
            <input 
              type="checkbox" 
              checked={useEncryption} 
              onChange={(e) => handleEncryptionToggle(e.target.checked)} 
              className="encryption-option__checkbox"
            />
            Use Password Protection
          </label>
          
          {useEncryption && (
            <div className="encryption-option__password">
              <input 
                type="password" 
                value={password} 
                onChange={(e) => handlePasswordChange(e.target.value)} 
                placeholder="Enter password" 
                className="encryption-option__password-input"
              />
            </div>
          )}
        </div>
        
        <div className="app__content">
          <div className="app__panel">
            <h2>{mode === 'encode' ? 'Encode Message' : 'Decode Message'}</h2>
            
            {mode === 'encode' && (
              <div className="encode-panel">
                <div className="file-upload">
                  <h3>Cover Image</h3>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      coverImageUpload.handleFileChange(e);
                      if (e.target.files && e.target.files[0]) {
                        loggingService.logUserAction('Uploaded cover image', {
                          fileName: e.target.files[0].name,
                          fileSize: e.target.files[0].size,
                          fileType: e.target.files[0].type
                        });
                      }
                    }} 
                    className="file-upload__input"
                  />
                  <div className="file-upload__dropzone">
                    <p>Drag & drop files here or click to browse</p>
                    {coverImageUpload.error && <p className="error">{coverImageUpload.error}</p>}
                  </div>
                  
                  {coverImageUpload.fileDataURL && (
                    <div className="image-preview">
                      <img src={coverImageUpload.fileDataURL} alt="Cover" className="image-preview__img" />
                    </div>
                  )}
                </div>
                
                <div className="text-input">
                  <h3>Message to Hide</h3>
                  <textarea 
                    value={inputText} 
                    onChange={(e) => handleTextChange(e.target.value)} 
                    placeholder="Enter your secret message here" 
                    className="text-input__textarea"
                  ></textarea>
                </div>
                
                <button 
                  onClick={handleEncode} 
                  disabled={isProcessing} 
                  className="action-button"
                >
                  {isProcessing ? 'Processing...' : 'Encode'}
                </button>
                
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                
                {resultImageUrl && (
                  <div className="result">
                    <h3>Encoded Image</h3>
                    <div className="image-preview">
                      <img src={resultImageUrl} alt="Encoded" className="image-preview__img" />
                    </div>
                    <button 
                      onClick={handleDownload} 
                      className="download-button"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {mode === 'decode' && (
              <div className="decode-panel">
                <div className="file-upload">
                  <h3>Image with Hidden Message</h3>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      stegoImageUpload.handleFileChange(e);
                      if (e.target.files && e.target.files[0]) {
                        loggingService.logUserAction('Uploaded image for decoding', {
                          fileName: e.target.files[0].name,
                          fileSize: e.target.files[0].size,
                          fileType: e.target.files[0].type
                        });
                      }
                    }} 
                    className="file-upload__input"
                  />
                  <div className="file-upload__dropzone">
                    <p>Drag & drop files here or click to browse</p>
                    {stegoImageUpload.error && <p className="error">{stegoImageUpload.error}</p>}
                  </div>
                  
                  {stegoImageUpload.fileDataURL && (
                    <div className="image-preview">
                      <img src={stegoImageUpload.fileDataURL} alt="Stego" className="image-preview__img" />
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleDecode} 
                  disabled={isProcessing} 
                  className="action-button"
                >
                  {isProcessing ? 'Processing...' : 'Decode'}
                </button>
                
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                
                {outputText && (
                  <div className="result">
                    <h3>Decoded Message</h3>
                    <div className="decoded-message">
                      <textarea 
                        value={outputText} 
                        readOnly 
                        className="decoded-message__textarea"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {showShadcnDemo && <ShadcnDemo />}
    </div>
  );
}

export default App;
