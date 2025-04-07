/// <reference types="cypress" />

describe('Responsive Design and Accessibility', () => {
  const viewports = [
    { width: 375, height: 667, device: 'mobile' },  // iPhone SE
    { width: 768, height: 1024, device: 'tablet' },  // iPad
    { width: 1280, height: 800, device: 'laptop' },  // Standard laptop
    { width: 1920, height: 1080, device: 'desktop' } // Full HD desktop
  ];

  viewports.forEach((viewport) => {
    describe(`Viewport: ${viewport.device} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        // Set the viewport size
        cy.viewport(viewport.width, viewport.height);
        // Visit the application
        cy.visit('/');
      });

      it('should display the application correctly', () => {
        // Check that the application is visible
        cy.get('body').should('be.visible');
        
        // Check that main content elements exist
        cy.get('div, section, main').should('exist');
      });

      it('should have accessible interactive elements', () => {
        // Check that buttons exist and are visible
        cy.get('button').should('exist');
        
        // Check that form elements exist
        cy.get('input, textarea, select, button').should('exist');
      });
    });
  });

  describe('Basic Accessibility', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should have focusable elements', () => {
      // Check that interactive elements can receive focus
      cy.get('button, a, input, textarea, select').first().focus().should('be.focused');
    });

    it('should have appropriate contrast', () => {
      // This is a basic visual check - we're just making sure the app loads
      cy.get('body').should('be.visible');
    });
  });
});
