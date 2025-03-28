// api/forum/index.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { authenticateJWT, isAuthenticated } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

// Validation schema for creating forum posts
const createPostSchema = z.object({
  title: z.string().min(3).max(150),
  content: z.string().min(10),
  categoryId: z.number().int().positive().optional()
});

// Validation schema for creating forum replies
const createReplySchema = z.object({
  content: z.string().min(2),
  postId: z.number().int().positive()
});

const router = express.Router();
router.use(cors());
router.use(express.json());
router.use(authenticateJWT);

// Root route - same as /posts
router.get('/', async (req, res) => {
  try {
    console.log('Fetching forum posts...');
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const posts = await storage.getForumPosts(limit);
    console.log('Posts from storage:', JSON.stringify(posts, null, 2));
    
    if (!Array.isArray(posts)) {
      console.error('Posts is not an array:', posts);
      return errorResponse(res, 500, "Invalid posts data format");
    }
    
    // Add reply count to each post
    const postsWithReplyCounts = await Promise.all(
      posts.map(async (post) => {
        console.log('Processing post:', JSON.stringify(post, null, 2));
        const replies = await storage.getForumReplies(post._id);
        console.log('Replies for post:', JSON.stringify(replies, null, 2));
        return {
          ...post,
          replyCount: replies.length
        };
      })
    );
    
    console.log('Final posts with reply counts:', JSON.stringify(postsWithReplyCounts, null, 2));
    return successResponse(res, 200, postsWithReplyCounts);
  } catch (error) {
    console.error("Failed to fetch forum posts:", error);
    console.error("Error stack:", error.stack);
    return errorResponse(res, 500, "Failed to fetch forum posts");
  }
});

// Get all forum posts
router.get('/posts', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const posts = await storage.getForumPosts(limit);
    
    // Add reply count to each post
    const postsWithReplyCounts = await Promise.all(
      posts.map(async (post) => {
        const replies = await storage.getForumReplies(post._id);
        return {
          ...post,
          replyCount: replies.length
        };
      })
    );
    
    return successResponse(res, 200, postsWithReplyCounts);
  } catch (error) {
    console.error("Failed to fetch forum posts:", error);
    return errorResponse(res, 500, "Failed to fetch forum posts");
  }
});

// Get forum post by ID with replies
router.get('/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const post = await storage.getForumPost(id);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }
    
    // Get replies for this post
    const replies = await storage.getForumReplies(id);
    
    return successResponse(res, 200, {
      post,
      replies
    });
  } catch (error) {
    console.error("Failed to fetch forum post:", error);
    return errorResponse(res, 500, "Failed to fetch forum post");
  }
});

// Create a forum post (for authenticated users only)
router.post('/posts', isAuthenticated, async (req, res) => {
  try {
    const postData = createPostSchema.parse(req.body);
    
    const post = await storage.createForumPost({
      ...postData,
      userId: req.user.id
    });
    
    return successResponse(res, 201, post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid post data", error.errors);
    }
    console.error("Failed to create forum post:", error);
    return errorResponse(res, 500, "Failed to create forum post");
  }
});

// Create a forum reply (for authenticated users only)
router.post('/replies', isAuthenticated, async (req, res) => {
  try {
    const replyData = createReplySchema.parse(req.body);
    
    // Check if the post exists
    const post = await storage.getForumPost(replyData.postId);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }
    
    const reply = await storage.createForumReply({
      ...replyData,
      userId: req.user.id
    });
    
    return successResponse(res, 201, reply);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid reply data", error.errors);
    }
    console.error("Failed to create forum reply:", error);
    return errorResponse(res, 500, "Failed to create forum reply");
  }
});

export default router;