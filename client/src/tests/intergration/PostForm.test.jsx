// client/src/tests/integration/PostForm.test.jsx - Integration test for PostForm component with API

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostForm from '../../components/PostForm'; // Assume this form component exists and uses fetch for /api/posts

describe('PostForm Integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('submits valid form data to API and handles success', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ _id: 'newpost', title: 'Test Post' }) });

    render(<PostForm />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Post' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Test Content' } });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/posts',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': expect.any(String) },
          body: JSON.stringify({ title: 'Test Post', content: 'Test Content', category: expect.any(String) }),
        })
      );
    });
    expect(screen.getByText(/post created successfully/i)).toBeInTheDocument();
  });

  it('handles API validation failure', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 400, json: jest.fn().mockResolvedValue({ error: 'Title required' }) });

    render(<PostForm />);
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'No Title' } });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(screen.getByText(/error: title required/i)).toBeInTheDocument();
    });
  });

  it('handles unauthorized submission', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401, json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }) });

    render(<PostForm />);
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
    });
  });
});