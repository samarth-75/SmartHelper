import { db } from '../config/db.js';

export const getPosts = (req, res) => {
  const q = `
    SELECT p.id, p.authorId, p.description, p.imageUrl, p.createdAt,
           u.name as authorName, u.avatar as authorAvatar,
           (SELECT COUNT(*) FROM followers f WHERE f.authorId = p.authorId) as followerCount
    FROM posts p
    JOIN users u ON u.id = p.authorId
    ORDER BY datetime(p.createdAt) DESC
  `;
  db.all(q, [], (err, rows) => {
    if (err) return res.status(500).json(err);
    const posts = rows.map((r) => ({
      id: r.id,
      author: { id: r.authorId, name: r.authorName, avatar: r.authorAvatar },
      description: r.description,
      imageUrl: r.imageUrl,
      createdAt: r.createdAt,
      followerCount: r.followerCount || 0,
    }));

    // If user is authenticated, check which authors they follow
    if (req.user) {
      const currentUserId = req.user.id;
      db.all(
        `SELECT authorId FROM followers WHERE followerId = ?`,
        [currentUserId],
        (err, followedRows) => {
          if (err) {
            return res.json(posts);
          }
          const followedIds = new Set(followedRows.map(r => r.authorId));
          const postsWithFollowStatus = posts.map(p => ({
            ...p,
            isFollowing: followedIds.has(p.author.id)
          }));
          res.json(postsWithFollowStatus);
        }
      );
    } else {
      res.json(posts);
    }
  });
};

export const createPost = (req, res) => {
  // Only helpers can create posts
  if (!req.user || req.user.role !== 'helper') return res.status(403).json({ error: 'Only helpers can create posts' });
  const { description, imageUrl } = req.body;
  const q = `INSERT INTO posts (authorId, description, imageUrl, createdAt) VALUES (?, ?, ?, ?)`;
  const now = new Date().toISOString();
  db.run(q, [req.user.id, description || '', imageUrl || null, now], function (err) {
    if (err) return res.status(500).json(err);
    const id = this.lastID;
    db.get(`SELECT p.id, p.authorId, p.description, p.imageUrl, p.createdAt, u.name as authorName, u.avatar as authorAvatar FROM posts p JOIN users u ON u.id = p.authorId WHERE p.id = ?`, [id], (err, row) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({
        id: row.id,
        author: { id: row.authorId, name: row.authorName, avatar: row.authorAvatar },
        description: row.description,
        imageUrl: row.imageUrl,
        createdAt: row.createdAt,
        followerCount: 0,
      });
    });
  });
};

export const toggleFollow = (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const authorId = Number(req.params.authorId);
  const followerId = req.user.id;
  if (authorId === followerId) return res.status(400).json({ error: 'Cannot follow yourself' });

  // Check if already following
  db.get(`SELECT id FROM followers WHERE authorId = ? AND followerId = ?`, [authorId, followerId], (err, row) => {
    if (err) return res.status(500).json(err);
    if (row) {
      // unfollow
      db.run(`DELETE FROM followers WHERE id = ?`, [row.id], function (err) {
        if (err) return res.status(500).json(err);
        db.get(`SELECT COUNT(*) as count FROM followers WHERE authorId = ?`, [authorId], (err, c) => {
          if (err) return res.status(500).json(err);
          res.json({ following: false, count: c.count });
        });
      });
    } else {
      // follow
      db.run(`INSERT INTO followers (authorId, followerId) VALUES (?, ?)`, [authorId, followerId], function (err) {
        if (err) return res.status(500).json(err);
        db.get(`SELECT COUNT(*) as count FROM followers WHERE authorId = ?`, [authorId], (err, c) => {
          if (err) return res.status(500).json(err);
          res.json({ following: true, count: c.count });
        });
      });
    }
  });
};

export const deletePost = (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const postId = Number(req.params.postId);
  
  // Verify user owns the post
  db.get(`SELECT authorId FROM posts WHERE id = ?`, [postId], (err, row) => {
    if (err) return res.status(500).json(err);
    if (!row) return res.status(404).json({ error: 'Post not found' });
    if (row.authorId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    
    // Delete the post
    db.run(`DELETE FROM posts WHERE id = ?`, [postId], function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: postId });
    });
  });
};

export const getFollowerCount = (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  
  db.get(`SELECT COUNT(*) as count FROM followers WHERE authorId = ?`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json(err);
    res.json({ count: row?.count || 0 });
  });
};
