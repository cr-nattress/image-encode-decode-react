/// <reference types="cypress" />

describe('Shadcn UI Components', () => {
  beforeEach(() => {
    // Visit the application before each test
    cy.visit('/');
  });

  it('should toggle the Shadcn demo section', () => {
    // Initially, the Shadcn demo might not be visible
    cy.get('[data-cy=shadcn-demo], .shadcn-demo').should('not.exist');
    
    // Find and click the toggle button for Shadcn demo
    cy.contains('button', /Show Shadcn Demo|Toggle Shadcn/i).click();
    
    // Verify the Shadcn demo is now visible
    cy.get('[data-cy=shadcn-demo], .shadcn-demo, [class*="shadcn"]').should('be.visible');
    cy.contains('shadcn/ui Components').should('be.visible');
    
    // Hide the demo again
    cy.contains('button', /Hide Shadcn Demo|Toggle Shadcn/i).click();
    
    // Verify the Shadcn demo is now hidden
    cy.get('[data-cy=shadcn-demo], .shadcn-demo').should('not.exist');
  });

  it('should display various button components in the Shadcn demo', () => {
    // Show the Shadcn demo
    cy.contains('button', /Show Shadcn Demo|Toggle Shadcn/i).click();
    
    // Verify the Button Components section is visible
    cy.contains('Button Components').should('be.visible');
    
    // Check that different button variants are displayed
    cy.contains('button', 'Default').should('be.visible');
    cy.contains('button', 'Destructive').should('be.visible');
    cy.contains('button', 'Outline').should('be.visible');
    cy.contains('button', 'Secondary').should('be.visible');
    cy.contains('button', 'Ghost').should('be.visible');
    cy.contains('button', 'Link').should('be.visible');
  });

  it('should display input components in the Shadcn demo', () => {
    // Show the Shadcn demo
    cy.contains('button', /Show Shadcn Demo|Toggle Shadcn/i).click();
    
    // Verify the Input Component section is visible
    cy.contains('Input Component').should('be.visible');
    
    // Check that different input types are displayed
    cy.get('input[placeholder="Regular input"]').should('be.visible');
    cy.get('input[placeholder="Disabled input"]')
      .should('be.visible')
      .and('be.disabled');
  });

  it('should display card components in the Shadcn demo', () => {
    // Show the Shadcn demo
    cy.contains('button', /Show Shadcn Demo|Toggle Shadcn/i).click();
    
    // Verify the Card Component section is visible
    cy.contains('Card Component').should('be.visible');
    
    // Check that the card has the expected content
    cy.contains('This is an example of the Card component').should('be.visible');
    
    // Check that the card footer has buttons
    cy.contains('button', 'Cancel').should('be.visible');
    cy.contains('button', 'Submit').should('be.visible');
  });

  it('should have interactive buttons in the Shadcn demo', () => {
    // Show the Shadcn demo
    cy.contains('button', /Show Shadcn Demo|Toggle Shadcn/i).click();
    
    // Click the buttons and verify they respond to user interaction
    cy.contains('button', 'Default').click();
    cy.contains('button', 'Outline').click();
    cy.contains('button', 'Secondary').click();
    
    // Verify the buttons in the card footer work
    cy.contains('button', 'Cancel').click();
    cy.contains('button', 'Submit').click();
  });
});
