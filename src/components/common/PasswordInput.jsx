import React, { useState, useEffect } from 'react';

/**
 * Password input component with strength indicator
 */
const PasswordInput = ({ 
  value, 
  onChange, 
  id, 
  placeholder = 'Enter password', 
  required = false,
  minLength = 4,
  disabled = false
}) => {
  const [strength, setStrength] = useState(0);
  
  // Calculate password strength whenever the value changes
  useEffect(() => {
    if (!value) {
      setStrength(0);
      return;
    }
    
    // Simple password strength calculation
    let score = 0;
    
    // Length check
    if (value.length >= minLength) score += 1;
    if (value.length >= 8) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(value)) score += 1; // Has uppercase
    if (/[a-z]/.test(value)) score += 1; // Has lowercase
    if (/[0-9]/.test(value)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(value)) score += 1; // Has special char
    
    // Normalize to 0-100
    const normalizedScore = Math.min(Math.floor((score / 6) * 100), 100);
    setStrength(normalizedScore);
  }, [value, minLength]);
  
  // Determine strength color and label
  const getStrengthColor = () => {
    if (strength < 30) return '#ff4d4d'; // Red
    if (strength < 60) return '#ffaa00'; // Orange
    if (strength < 80) return '#ffff00'; // Yellow
    return '#00cc00'; // Green
  };
  
  const getStrengthLabel = () => {
    if (!value) return '';
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };
  
  return (
    <div className="password-input-container">
      <input
        type="password"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        disabled={disabled}
        className="password-input"
        data-cy={`password-input-${id}`}
      />
      {value && (
        <div className="password-strength">
          <div 
            className="password-strength-bar" 
            style={{ 
              width: `${strength}%`, 
              backgroundColor: getStrengthColor() 
            }}
          />
          <span className="password-strength-label">
            {getStrengthLabel()}
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
