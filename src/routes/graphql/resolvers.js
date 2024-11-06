import { UUIDType } from './types/uuid';

const resolvers = {
    UUID: UUIDType,

  RootQueryType: {
    memberTypes: async (_, __, { dataSources }) => {
      return dataSources.api.getMemberTypes();
    },
    memberType: async (_, { id }, { dataSources }) => {
      return dataSources.api.getMemberType(id);
    },
    users: async (_, __, { dataSources }) => {
      return dataSources.api.getUsers();
    },
    user: async (_, { id }, { dataSources }) => {
      return dataSources.api.getUser(id);
    },
    posts: async (_, __, { dataSources }) => {
      return dataSources.api.getPosts();
    },
    post: async (_, { id }, { dataSources }) => {
      return dataSources.api.getPost(id);
    },
    profiles: async (_, __, { dataSources }) => {
      return dataSources.api.getProfiles();
    },
    profile: async (_, { id }, { dataSources }) => {
      return dataSources.api.getProfile(id);
    },
  },

  Mutations: {
    createUser: async (_, { dto }, { dataSources }) => {
      return dataSources.api.createUser(dto);
    },
    createProfile: async (_, { dto }, { dataSources }) => {
      return dataSources.api.createProfile(dto);
    },
    createPost: async (_, { dto }, { dataSources }) => {
      return dataSources.api.createPost(dto);
    },
    changePost: async (_, { id, dto }, { dataSources }) => {
      return dataSources.api.changePost(id, dto);
    },
    changeProfile: async (_, { id, dto }, { dataSources }) => {
      return dataSources.api.changeProfile(id, dto);
    },
    changeUser: async (_, { id, dto }, { dataSources }) => {
      return dataSources.api.changeUser(id, dto);
    },
    deleteUser: async (_, { id }, { dataSources }) => {
      await dataSources.api.deleteUser(id);
      return "User deleted successfully";
    },
    deletePost: async (_, { id }, { dataSources }) => {
      await dataSources.api.deletePost(id);
      return "Post deleted successfully";
    },
    deleteProfile: async (_, { id }, { dataSources }) => {
      await dataSources.api.deleteProfile(id);
      return "Profile deleted successfully";
    },
    subscribeTo: async (_, { userId, authorId }, { dataSources }) => {
      await dataSources.api.subscribeTo(userId, authorId);
      return "Subscribed successfully";
    },
    unsubscribeFrom: async (_, { userId, authorId }, { dataSources }) => {
      await dataSources.api.unsubscribeFrom(userId, authorId);
      return "Unsubscribed successfully";
    },
  },

  // Relationships and custom field resolvers
  User: {
    profile: async (user, _, { dataSources }) => {
      return dataSources.api.getProfileByUserId(user.id);
    },
    posts: async (user, _, { dataSources }) => {
      return dataSources.api.getPostsByUserId(user.id);
    },
    userSubscribedTo: async (user, _, { dataSources }) => {
      return dataSources.api.getUserSubscribedTo(user.id);
    },
    subscribedToUser: async (user, _, { dataSources }) => {
      return dataSources.api.getSubscribedToUser(user.id);
    },
  },
};

module.exports = resolvers;
