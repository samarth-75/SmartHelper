import express from 'express';
import { getPosts, createPost, toggleFollow, deletePost, getFollowerCount } from '../controllers/postsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/follower-count', protect, getFollowerCount);
router.post('/', protect, createPost);
router.post('/:authorId/follow', protect, toggleFollow);
router.delete('/:postId', protect, deletePost);

export default router;
