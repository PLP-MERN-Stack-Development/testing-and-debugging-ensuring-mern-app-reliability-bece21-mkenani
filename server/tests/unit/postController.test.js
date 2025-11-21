// server/tests/unit/postController.test.js - Unit tests for post controller

const { createPost, getPosts, getPostById, updatePost, deletePost } = require('../../src/controllers/postController');
const Post = require('../../src/models/Post');
jest.mock('../../src/models/Post');

describe('Post Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 'user123' }, body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('creates a post successfully', async () => {
    req.body = { title: 'New Post', content: 'Content', category: 'cat123' };
    const mockPost = { _id: 'post123', ...req.body, author: req.user.id };
    Post.create.mockResolvedValue(mockPost);

    await createPost(req, res);
    expect(Post.create).toHaveBeenCalledWith({ ...req.body, author: req.user.id, slug: expect.any(String) });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPost);
  });

  it('handles creation validation error', async () => {
    req.body = { content: 'No title' };
    Post.create.mockRejectedValue(new Error('Validation failed: title required'));

    await createPost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed: title required' });
  });

  it('gets all posts', async () => {
    req.query = {};
    const mockPosts = [{ _id: 'post1' }, { _id: 'post2' }];
    Post.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockPosts),
    });

    await getPosts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPosts);
  });

  it('gets post by ID', async () => {
    req.params.id = 'post123';
    const mockPost = { _id: 'post123' };
    Post.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockPost),
    });

    await getPostById(req, res);
    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPost);
  });

  it('handles get by ID not found', async () => {
    req.params.id = 'invalid';
    Post.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await getPostById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
  });

  it('updates a post', async () => {
    req.params.id = 'post123';
    req.body = { title: 'Updated' };
    const mockPost = { _id: 'post123', author: { _id: 'user123' }, save: jest.fn().mockResolvedValue({ ...req.body }) };
    Post.findById.mockResolvedValue(mockPost);

    await updatePost(req, res);
    expect(mockPost.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated' }));
  });

  it('handles update forbidden if not author', async () => {
    req.params.id = 'post123';
    const mockPost = { _id: 'post123', author: { _id: 'otheruser' } };
    Post.findById.mockResolvedValue(mockPost);

    await updatePost(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to update this post' });
  });

  it('deletes a post', async () => {
    req.params.id = 'post123';
    const mockPost = { _id: 'post123', author: { _id: 'user123' }, deleteOne: jest.fn().mockResolvedValue() };
    Post.findById.mockResolvedValue(mockPost);

    await deletePost(req, res);
    expect(mockPost.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post deleted' });
  });

  it('handles delete forbidden if not author', async () => {
    req.params.id = 'post123';
    const mockPost = { _id: 'post123', author: { _id: 'otheruser' } };
    Post.findById.mockResolvedValue(mockPost);

    await deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to delete this post' });
  });
});