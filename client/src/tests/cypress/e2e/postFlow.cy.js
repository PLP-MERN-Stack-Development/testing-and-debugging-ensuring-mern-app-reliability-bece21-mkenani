// client/cypress/e2e/postFlow.cy.js - End-to-end tests for post flows

describe('Post CRUD Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { token: 'faketoken' } }).as('login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.url().should('include', '/dashboard');
  });

  it('creates a post', () => {
    cy.intercept('POST', '/api/posts', { statusCode: 201, body: { _id: 'newpost', title: 'E2E Post' } }).as('createPost');
    cy.visit('/create');
    cy.get('input[name="title"]').type('E2E Post');
    cy.get('textarea[name="content"]').type('E2E Content');
    cy.get('button').contains('Create Post').click();
    cy.wait('@createPost');
    cy.url().should('include', '/posts/newpost');
    cy.contains('E2E Post').should('be.visible');
  });

  it('reads and navigates to a post', () => {
    cy.intercept('GET', '/api/posts', { statusCode: 200, body: [{ _id: 'post123', title: 'Existing Post' }] }).as('getPosts');
    cy.wait('@getPosts');
    cy.contains('Existing Post').click();
    cy.url().should('include', '/posts/post123');
    cy.contains('Existing Post').should('be.visible');
  });

  it('updates a post', () => {
    cy.intercept('PUT', '/api/posts/post123', { statusCode: 200, body: { title: 'Updated Post' } }).as('updatePost');
    cy.visit('/posts/post123/edit');
    cy.get('input[name="title"]').clear().type('Updated Post');
    cy.get('button').contains('Update Post').click();
    cy.wait('@updatePost');
    cy.contains('Updated Post').should('be.visible');
  });

  it('deletes a post', () => {
    cy.intercept('DELETE', '/api/posts/post123', { statusCode: 200 }).as('deletePost');
    cy.visit('/posts/post123');
    cy.get('button').contains('Delete').click();
    cy.wait('@deletePost');
    cy.url().should('include', '/dashboard');
    cy.contains('Post deleted').should('be.visible');
  });

  it('handles error on creation', () => {
    cy.intercept('POST', '/api/posts', { statusCode: 400, body: { error: 'Validation failed' } }).as('createFail');
    cy.visit('/create');
    cy.get('button').contains('Create Post').click();
    cy.wait('@createFail');
    cy.contains('Validation failed').should('be.visible');
  });
});