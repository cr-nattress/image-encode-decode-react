import React, { useState, useRef, useEffect } from 'react';
import './styles/main.scss';
import useFileUpload from './hooks/useFileUpload';
import imageService from './services/imageService';
import cryptoService from './services/cryptoService';
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
  
  // Canvas reference for downloading
  const canvasRef = useRef(null);
  
  // File upload hooks
  const coverImageUpload = useFileUpload();
  const stegoImageUpload = useFileUpload();
  
  // State for result image
  const [resultImageUrl, setResultImageUrl] = useState('');
  
  // State for showing shadcn demo
  const [showShadcnDemo, setShowShadcnDemo] = useState(false);

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
  }, [mode, coverImageUpload, stegoImageUpload]); // Include all dependencies
  
  // Handle encoding
  const handleEncode = async () => {
    setError('');
    setSuccess('');
    setResultImageUrl('');
    
    try {
      setIsProcessing(true);
      
      if (!inputText) {
        throw new Error('Please enter text to encode');
      }
      
      if (!coverImageUpload.fileDataURL) {
        throw new Error('Please upload a cover image');
      }
      
      // Convert text to bytes
      const encoder = new TextEncoder();
      let dataToEncode;
      
      // Encrypt if needed
      if (useEncryption && password) {
        dataToEncode = await cryptoService.encrypt(inputText, password);
        dataToEncode = new Uint8Array(dataToEncode); // Ensure it's a Uint8Array
      } else {
        dataToEncode = encoder.encode(inputText);
      }
      
      // LSB encoding requires a cover image
      const coverImage = await imageService.dataURLToImage(coverImageUpload.fileDataURL);
      const encodedImageUrl = await imageService.lsbEncode(coverImage, dataToEncode);
      
      setResultImageUrl(encodedImageUrl);
      setSuccess('Message encoded successfully!');
    } catch (err) {
      console.error('Encoding error:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle decoding
  const handleDecode = async () => {
    setError('');
    setSuccess('');
    setOutputText('');
    
    try {
      setIsProcessing(true);
      
      if (!stegoImageUpload.fileDataURL) {
        throw new Error('Please upload an image to decode');
      }
      
      const stegoImage = await imageService.dataURLToImage(stegoImageUpload.fileDataURL);
      
      // Use LSB decoding
      const decodedData = imageService.lsbDecode(stegoImage);
      
      // Check if data is encrypted
      let decodedText;
      if (useEncryption && password) {
        try {
          // Try to decrypt
          if (cryptoService.hasEncryptionMetadata(decodedData.buffer)) {
            const decryptedData = await cryptoService.decrypt(decodedData.buffer, password);
            const decoder = new TextDecoder();
            decodedText = decoder.decode(decryptedData);
          } else {
            throw new Error('The data does not appear to be encrypted');
          }
        } catch (decryptErr) {
          throw new Error(`Decryption failed: ${decryptErr.message}. Check your password.`);
        }
      } else {
        // Assume it's plain text
        const decoder = new TextDecoder();
        decodedText = decoder.decode(decodedData);
      }
      
      setOutputText(decodedText);
      setSuccess('Message decoded successfully!');
    } catch (err) {
      console.error('Decoding error:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle download of encoded image
  const handleDownload = () => {
    if (resultImageUrl) {
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
            onClick={() => setMode('encode')}
          >
            Encode
          </button>
          <button 
            className={`mode-selector__button ${mode === 'decode' ? 'mode-selector__button--active' : ''}`} 
            onClick={() => setMode('decode')}
          >
            Decode
          </button>
        </div>
        <Button 
          className="shadcn-demo-toggle"
          onClick={() => setShowShadcnDemo(!showShadcnDemo)}
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
              onChange={(e) => setUseEncryption(e.target.checked)} 
            />
            Use Password Protection
          </label>
          {useEncryption && (
            <input 
              className="encryption-option__input"
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          )}
        </div>
        
        {mode === 'encode' ? (
          <div className="encode-container">
            <div className="input-section">
              <h2>Text to Encode</h2>
              <textarea 
                className="textarea"
                rows="6" 
                placeholder="Enter text to hide in the image..." 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
              />
              
              <div className="file-upload">
                <h2>Cover Image</h2>
                <input 
                  className="file-upload__input"
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => coverImageUpload.handleFileChange(e)} 
                />
                {coverImageUpload.error && <p className="error-message">{coverImageUpload.error}</p>}
                {coverImageUpload.fileDataURL && (
                  <div className="image-preview">
                    <img className="image-preview__img" src={coverImageUpload.fileDataURL} alt="Cover" />
                  </div>
                )}
              </div>
              
              <button 
                className="button"
                onClick={handleEncode} 
                disabled={isProcessing || !coverImageUpload.fileDataURL || !inputText}
              >
                {isProcessing ? 'Encoding...' : 'Encode'}
              </button>
            </div>
            
            <div className="output-section">
              <h2>Result</h2>
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}
              
              {resultImageUrl && (
                <div className="result-container">
                  <div className="image-preview">
                    <img className="image-preview__img" src={resultImageUrl} alt="Encoded" />
                  </div>
                  <button className="download-button" onClick={handleDownload}>Download Encoded Image</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="decode-container">
            <div className="input-section">
              <h2>Image to Decode</h2>
              <input 
                className="file-upload__input"
                type="file" 
                accept="image/*" 
                onChange={(e) => stegoImageUpload.handleFileChange(e)} 
              />
              {stegoImageUpload.error && <p className="error-message">{stegoImageUpload.error}</p>}
              {stegoImageUpload.fileDataURL && (
                <div className="image-preview">
                  <img className="image-preview__img" src={stegoImageUpload.fileDataURL} alt="To decode" />
                </div>
              )}
              
              <button 
                className="button"
                onClick={handleDecode} 
                disabled={isProcessing || !stegoImageUpload.fileDataURL}
              >
                {isProcessing ? 'Decoding...' : 'Decode'}
              </button>
            </div>
            
            <div className="output-section">
              <h2>Decoded Text</h2>
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}
              
              {outputText && (
                <div className="result-container">
                  <textarea 
                    className="textarea"
                    rows="6" 
                    value={outputText} 
                    readOnly 
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {showShadcnDemo && <ShadcnDemo />}
      </main>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
