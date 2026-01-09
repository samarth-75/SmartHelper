const POSTS_KEY = 'sh_posts_v1';
const FOLLOWERS_KEY = 'sh_followers_v1';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getPosts = () => {
  const posts = read(POSTS_KEY, []);
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const addPost = (post) => {
  const posts = read(POSTS_KEY, []);
  posts.push(post);
  write(POSTS_KEY, posts);
  return post;
};

export const clearPosts = () => {
  write(POSTS_KEY, []);
};

// Follower helpers keyed by authorId -> array of userIds
const readFollowers = () => read(FOLLOWERS_KEY, {});

export const getFollowersFor = (authorId) => {
  const all = readFollowers();
  return all[authorId] || [];
};

export const getFollowerCount = (authorId) => getFollowersFor(authorId).length;

export const isFollowing = (authorId, userId) => {
  if (!userId) return false;
  return getFollowersFor(authorId).includes(userId);
};

export const toggleFollow = (authorId, userId) => {
  if (!userId) return { success: false };
  const all = readFollowers();
  const list = new Set(all[authorId] || []);
  let following = false;
  if (list.has(userId)) {
    list.delete(userId);
    following = false;
  } else {
    list.add(userId);
    following = true;
  }
  all[authorId] = Array.from(list);
  write(FOLLOWERS_KEY, all);
  return { success: true, following, count: all[authorId].length };
};

export default { getPosts, addPost, clearPosts, getFollowerCount, toggleFollow, isFollowing };
