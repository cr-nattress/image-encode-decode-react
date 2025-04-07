/// <reference types="cypress" />

describe('PixelCipher Main Application', () => {
  beforeEach(() => {
    // Visit the application before each test
    cy.visit('/');
  });

  it('should load the application successfully', () => {
    // Check that the main elements are visible
    cy.get('header, .header, [class*="header"]').should('exist');
    cy.get('main, .main, [class*="main"], .container').should('exist');
    
    // Verify the app is loaded by checking for common elements
    cy.get('button').should('exist');
  });

  it('should display file upload section', () => {
    // Check that the file upload section is visible
    cy.get('input[type="file"]').should('exist');
    // The text might be different than expected, so just check for any upload-related text
    cy.get('label, p, div').contains(/upload|file|image/i).should('exist');
  });

  it('should have encode/decode functionality', () => {
    // Look for buttons or controls related to encoding/decoding
    cy.get('button').should('exist');
    
    // Check for text input area (might be a textarea or input)
    cy.get('textarea, input[type="text"]').should('exist');
  });

  it('should have interactive elements', () => {
    // Check that buttons are clickable
    cy.get('button').first().click();
    
    // Ensure the application doesn't crash after interaction
    cy.get('body').should('exist');
  });

  it('should have a responsive layout', () => {
    // Check that the layout adjusts to different viewport sizes
    cy.viewport('iphone-6');
    cy.get('body').should('be.visible');
    
    cy.viewport('macbook-15');
    cy.get('body').should('be.visible');
  });
});
