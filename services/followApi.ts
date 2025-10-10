import { FollowUser, mockFollowers, mockFollowing } from '@/constants/followData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const followService = {
  // Lấy danh sách followers
  async getFollowers(userId: string): Promise<FollowUser[]> {
    await delay(800);
    return mockFollowers;
  },

  // Lấy danh sách following
  async getFollowing(userId: string): Promise<FollowUser[]> {
    await delay(800);
    return mockFollowing;
  },

  // Follow user
  async followUser(userId: string): Promise<boolean> {
    await delay(500);
    // Simulate success
    return true;
  },

  // Unfollow user
  async unfollowUser(userId: string): Promise<boolean> {
    await delay(500);
    // Simulate success
    return true;
  },

  // Remove follower
  async removeFollower(userId: string): Promise<boolean> {
    await delay(500);
    // Simulate success
    return true;
  },

  // Tìm kiếm users
  async searchUsers(query: string): Promise<FollowUser[]> {
    await delay(300);
    
    const allUsers = [...mockFollowers, ...mockFollowing];
    const uniqueUsers = Array.from(
      new Map(allUsers.map(user => [user.id, user])).values()
    );

    if (!query.trim()) {
      return uniqueUsers;
    }

    const lowercaseQuery = query.toLowerCase();
    return uniqueUsers.filter(
      user =>
        user.name.toLowerCase().includes(lowercaseQuery) ||
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.bio.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<FollowUser | null> {
    await delay(500);
    
    const allUsers = [...mockFollowers, ...mockFollowing];
    return allUsers.find(user => user.id === userId) || null;
  },
};