import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { Posts } from './posts.js';
import { Profile } from './profile.js';

//- user (Object Type)
export const User = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: async (parent, _, context) => {
        return context.prisma.profile.findUnique({
          where: { userId: parent.id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(Posts),
      resolve: async (parent, _, context) => {
        if (parent.id) {
          return context.prisma.post.findMany({
            where: { authorId: parent.id },
          });
        }
        return null;
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(User)),
      resolve: async (parent, _, context) => {
        return context.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: parent.id,
              },
            },
          },
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(User)),
      resolve: async (parent, _, context) => {
        return context.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: parent.id,
              },
            },
          },
        });
      },
    },
  }),
});

//- user mutations (Input Types)
export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

//- user mutation (Resolvers)
export const UserMutations = {
  createUser: {
    type: User,
    args: {
      dto: { type: new GraphQLNonNull(CreateUserInput) },
    },
    resolve: async (_, { dto }, { prisma }) => {
      const user = await prisma.user.create({
        data: {
          name: dto.name,
          balance: dto.balance,
        },
      });
      return user;
    },
  },

  changeUser: {
    type: User,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
      dto: { type: new GraphQLNonNull(ChangeUserInput) },
    },
    resolve: async (_, { id, dto }, { prisma }) => {
      const user = await prisma.user.update({
        where: { id },
        data: {
          name: dto.name,
          balance: dto.balance,
        },
      });
      return user;
    },
  },

  deleteUser: {
    type: GraphQLString,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_, { id }, { prisma }) => {
      await prisma.user.delete({
        where: { id },
      });
      return "User deleted successfully";
    },
  },

  subscribeTo: {
    type: GraphQLString,
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_, { userId, authorId }, { prisma }) => {
      await prisma.subscribersOnAuthors.create({
        data: {
          subscriberId: userId,
          authorId,
        },
      });
      return 'User subscribed successfully';
    },
  },

  unsubscribeFrom: {
    type: GraphQLString,
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_, { userId, authorId }, { prisma }) => {
      await prisma.subscribersOnAuthors.delete({
        where: {
          subscriberId_authorId: {
            authorId,
            subscriberId: userId,
          },
        },
      });
      return 'User unsubscribed successfully';
    },
  },
};

export const UserList = new GraphQLList(User);