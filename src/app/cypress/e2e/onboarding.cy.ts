describe('Onboarding Flow', () => {
    beforeEach(() => {
      // Reset database and create test user
      cy.task('db:seed')
      cy.visit('/auth/signup')
    })
  
    it('completes full onboarding flow', () => {
      // Sign up
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
  
      // Should redirect to signin
      cy.url().should('include', '/auth/signin')
  
      // Sign in
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
  
      // Should start onboarding
      cy.url().should('include', '/onboarding')
  
      // Step 1: Name
      cy.contains("What should I call you?").should('be.visible')
      cy.get('input[type="text"]').type('John')
      cy.get('button').contains('Send').click()
  
      // Step 2: Goals
      cy.contains("What are your main goals").should('be.visible')
      cy.get('button').contains('Productivity').click()
      cy.get('button').contains('Health & Fitness').click()
      cy.get('button').contains('Continue').click()
  
      // Step 3: Challenge
      cy.contains("biggest challenge").should('be.visible')
      cy.get('input[type="text"]').type('Time management')
      cy.get('button').contains('Send').click()
  
      // Step 4: Productive time
      cy.contains("most productive").should('be.visible')
      cy.get('button').contains('Morning').click()
      cy.get('button').contains('Continue').click()
  
      // Step 5: AI Mode
      cy.contains("How would you like me to help").should('be.visible')
      cy.get('button').contains('Guide me').click()
      cy.get('button').contains('Continue').click()
  
      // Should complete and redirect to dashboard
      cy.contains("setting up your personalized workspace").should('be.visible')
      cy.url().should('include', '/dashboard', { timeout: 10000 })
    })
  })