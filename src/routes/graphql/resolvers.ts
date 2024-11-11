import { UUIDType } from './types/uuid.js';
import { UserMutations } from './users.js';
import { PostMutations } from './posts.js';
import { ProfileMutations } from './profile.js';

const resolvers = {
  UUID: UUIDType,

  RootQueryType: {
    memberTypes: async (_, __, { prisma }) => prisma.memberType.findMany(),
    memberType: async (_, { id }, { prisma }) => {
      console.log('Fetching memberType with ID:', id); //- debugging
      return prisma.memberType.findUnique({ where: { id } });
    },
    users: async (_, __, { prisma }) => prisma.user.findMany(),
    user: async (_, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),
    posts: async (_, __, { prisma }) => prisma.post.findMany(),
    post: async (_, { id }, { prisma }) => prisma.post.findUnique({ where: { id } }),
    profiles: async (_, __, { prisma }) => prisma.profile.findMany(),
    profile: async (_, { id }, { prisma }) => prisma.profile.findUnique({ where: { id } }),
  },

  Mutation: {
    ...UserMutations,
    ...PostMutations,
    ...ProfileMutations,

    //- mutation for subscribing a user to an author
    subscribeTo: async (_, { userId, authorId }, { prisma }) => {
      try {
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId,
          },
        });
        return 'Subscribed successfully';
      } catch (error) {
        console.error('Error subscribing user:', error);
        throw new Error('Failed to subscribe');
      }
    },

    //- mutation for unsubscribing a user from an author
    unsubscribeFrom: async (_, { userId, authorId }, { prisma }) => {
      try {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });
        return 'Unsubscribed successfully';
      } catch (error) {
        console.error('Error unsubscribing user:', error);
        throw new Error('Failed to unsubscribe');
      }
    },
  },
};

export default resolvers;
