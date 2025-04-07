import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordInput from './PasswordInput';

describe('PasswordInput component', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });
  
  test('renders with default props', () => {
    render(<PasswordInput value="" onChange={mockOnChange} id="test-password" />);
    
    const inputElement = screen.getByPlaceholderText('Enter password');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'password');
    expect(inputElement).toHaveAttribute('id', 'test-password');
    expect(inputElement).not.toBeRequired();
  });
  
  test('calls onChange when input value changes', () => {
    render(<PasswordInput value="" onChange={mockOnChange} id="test-password" />);
    
    const inputElement = screen.getByPlaceholderText('Enter password');
    fireEvent.change(inputElement, { target: { value: 'test123' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test123');
  });
  
  test('shows strength indicator when password is entered', () => {
    const { rerender } = render(
      <PasswordInput value="" onChange={mockOnChange} id="test-password" />
    );
    
    // No strength indicator when empty
    expect(screen.queryByText(/Weak|Fair|Good|Strong/)).not.toBeInTheDocument();
    
    // Rerender with a password value
    rerender(<PasswordInput value="test123" onChange={mockOnChange} id="test-password" />);
    
    // Strength indicator should now be visible
    expect(screen.getByText(/Weak|Fair|Good|Strong/)).toBeInTheDocument();
  });
  
  test('shows correct strength label for different passwords', () => {
    const { rerender } = render(
      <PasswordInput value="" onChange={mockOnChange} id="test-password" />
    );
    
    // Test weak password
    rerender(<PasswordInput value="abc" onChange={mockOnChange} id="test-password" />);
    expect(screen.getByText('Weak')).toBeInTheDocument();
    
    // Test fair password
    rerender(<PasswordInput value="Abcdef1" onChange={mockOnChange} id="test-password" />);
    expect(screen.getByText('Fair')).toBeInTheDocument();
    
    // Test good password
    rerender(<PasswordInput value="Abcdef1!" onChange={mockOnChange} id="test-password" />);
    expect(screen.getByText('Good')).toBeInTheDocument();
    
    // Test strong password
    rerender(<PasswordInput value="Abcdef1!2345" onChange={mockOnChange} id="test-password" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });
  
  test('respects disabled prop', () => {
    render(
      <PasswordInput 
        value="test123" 
        onChange={mockOnChange} 
        id="test-password" 
        disabled={true} 
      />
    );
    
    const inputElement = screen.getByPlaceholderText('Enter password');
    expect(inputElement).toBeDisabled();
  });
  
  test('respects required prop', () => {
    render(
      <PasswordInput 
        value="test123" 
        onChange={mockOnChange} 
        id="test-password" 
        required={true} 
      />
    );
    
    const inputElement = screen.getByPlaceholderText('Enter password');
    expect(inputElement).toBeRequired();
  });
  
  test('respects custom placeholder', () => {
    render(
      <PasswordInput 
        value="test123" 
        onChange={mockOnChange} 
        id="test-password" 
        placeholder="Custom placeholder" 
      />
    );
    
    const inputElement = screen.getByPlaceholderText('Custom placeholder');
    expect(inputElement).toBeInTheDocument();
  });
  
  test('respects minLength prop', () => {
    const { rerender } = render(
      <PasswordInput 
        value="123" 
        onChange={mockOnChange} 
        id="test-password" 
        minLength={6}
      />
    );
    
    // Password is shorter than minLength, should be weak
    expect(screen.getByText('Weak')).toBeInTheDocument();
    
    // Rerender with longer password
    rerender(
      <PasswordInput 
        value="123456" 
        onChange={mockOnChange} 
        id="test-password" 
        minLength={6}
      />
    );
    
    // Password meets minLength, should be at least fair
    expect(screen.queryByText('Weak')).not.toBeInTheDocument();
  });
});
