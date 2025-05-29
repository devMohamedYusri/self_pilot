describe('AI Suggestions', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123')
      cy.visit('/dashboard')
    })
  
    it('shows AI suggestions panel', () => {
      cy.contains('AI Suggestions').should('be.visible')
    })
  
    it('allows approving AI suggestions', () => {
      // Create AI suggestion via API
      cy.request('POST', '/api/test/create-suggestion', {
        type: 'task',
        title: 'Test AI Task'
      })
  
      cy.visit('/dashboard')
      cy.contains('Test AI Task').should('be.visible')
      
      // Approve suggestion
      cy.get('[aria-label="Approve"]').first().click()
      cy.contains('Task created successfully').should('be.visible')
    })
  
    it('allows rejecting AI suggestions', () => {
      // Create AI suggestion
      cy.request('POST', '/api/test/create-suggestion', {
        type: 'task',
        title: 'Test AI Task to Reject'
      })
  
      cy.visit('/dashboard')
      cy.contains('Test AI Task to Reject').should('be.visible')
      
      // Reject suggestion
      cy.get('[aria-label="Reject"]').first().click()
      cy.contains('Suggestion has been rejected').should('be.visible')
    })
  
    it('opens AI chat when clicking chat button', () => {
      cy.get('[aria-label="Open AI Assistant"]').click()
      cy.contains('AI Assistant').should('be.visible')
      cy.get('input[placeholder="Type your message..."]').should('be.visible')
    })
  })