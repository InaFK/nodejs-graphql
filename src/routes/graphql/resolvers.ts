import { UUIDType } from './types/uuid.js';

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
};

export default resolvers;
