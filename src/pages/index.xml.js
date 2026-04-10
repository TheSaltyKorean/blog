// Legacy Jekyll feed path — _config.yml had feed.collections.posts.path: "/index.xml"
// Duplicated endpoint so existing subscribers at /index.xml don't break.
export { GET } from './feed.xml.js';
