export const fetchAllPosts = repo => async () => {
  return await repo.getAllPosts();
};