import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { getMemberTypeByIdSchema, memberTypeSchema } from './schemas.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { UUIDType } from './types/uuid';

//- GraphQL schema
const typeDefs = `
  scalar UUID

  # Enums
  enum MemberTypeId {
    BASIC
    BUSINESS
  }

  # Input Types
  input ChangePostInput {
    title: String
    content: String
  }

  input ChangeProfileInput {
    isMale: Boolean
    yearOfBirth: Int
    memberTypeId: MemberTypeId
  }

  input ChangeUserInput {
    name: String
    balance: Float
  }

  input CreatePostInput {
    title: String!
    content: String!
    authorId: UUID!
  }

  input CreateProfileInput {
    isMale: Boolean!
    yearOfBirth: Int!
    userId: UUID!
    memberTypeId: MemberTypeId!
  }

  input CreateUserInput {
    name: String!
    balance: Float!
  }

  # Types
  type MemberType {
    id: MemberTypeId!
    discount: Float!
    postsLimitPerMonth: Int!
  }

  type Post {
    id: UUID!
    title: String!
    content: String!
  }

  type Profile {
    id: UUID!
    isMale: Boolean!
    yearOfBirth: Int!
    memberType: MemberType!
  }

  type User {
    id: UUID!
    name: String!
    balance: Float!
    profile: Profile
    posts: [Post!]!
    userSubscribedTo: [User!]!
    subscribedToUser: [User!]!
  }

  # Root Query Type
  type RootQueryType {
    memberTypes: [MemberType!]!
    memberType(id: MemberTypeId!): MemberType
    users: [User!]!
    user(id: UUID!): User
    posts: [Post!]!
    post(id: UUID!): Post
    profiles: [Profile!]!
    profile(id: UUID!): Profile
  }

  # Mutations
  type Mutations {
    createUser(dto: CreateUserInput!): User!
    createProfile(dto: CreateProfileInput!): Profile!
    createPost(dto: CreatePostInput!): Post!
    changePost(id: UUID!, dto: ChangePostInput!): Post!
    changeProfile(id: UUID!, dto: ChangeProfileInput!): Profile!
    changeUser(id: UUID!, dto: ChangeUserInput!): User!
    deleteUser(id: UUID!): String!
    deletePost(id: UUID!): String!
    deleteProfile(id: UUID!): String!
    subscribeTo(userId: UUID!, authorId: UUID!): String!
    unsubscribeFrom(userId: UUID!, authorId: UUID!): String!
  }

  # Schema Declaration
  schema {
    query: RootQueryType
    mutation: Mutations
  }
`;

//- define resolvers that match the schema
const resolvers = {
  UUID: UUIDType,
  RootQueryType: {
    memberTypes: async (_parent, _args, { prisma }) => prisma.memberType.findMany(),
    memberType: async (_parent, { id }, { prisma }) => prisma.memberType.findUnique({ where: { id } }),
    users: async (_parent, _args, { prisma }) => prisma.user.findMany(),
    user: async (_parent, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),
    posts: async (_parent, _args, { prisma }) => prisma.post.findMany(),
    post: async (_parent, { id }, { prisma }) => prisma.post.findUnique({ where: { id } }),
    profiles: async (_parent, _args, { prisma }) => prisma.profile.findMany(),
    profile: async (_parent, { id }, { prisma }) => prisma.profile.findUnique({ where: { id } }),
  },
  Mutations: {
    createUser: async (_parent, { dto }, { prisma }) => prisma.user.create({ data: dto }),
    createProfile: async (_parent, { dto }, { prisma }) => prisma.profile.create({ data: dto }),
    createPost: async (_parent, { dto }, { prisma }) => prisma.post.create({ data: dto }),
    changePost: async (_parent, { id, dto }, { prisma }) => prisma.post.update({ where: { id }, data: dto }),
    changeProfile: async (_parent, { id, dto }, { prisma }) => prisma.profile.update({ where: { id }, data: dto }),
    changeUser: async (_parent, { id, dto }, { prisma }) => prisma.user.update({ where: { id }, data: dto }),
    deleteUser: async (_parent, { id }, { prisma }) => {
      await prisma.user.delete({ where: { id } });
      return "User deleted successfully";
    },
    deletePost: async (_parent, { id }, { prisma }) => {
      await prisma.post.delete({ where: { id } });
      return "Post deleted successfully";
    },
    deleteProfile: async (_parent, { id }, { prisma }) => {
      await prisma.profile.delete({ where: { id } });
      return "Profile deleted successfully";
    },
    subscribeTo: async (_parent, { userId, authorId }, { prisma }) => {
      //- add subscription logic here
      return "Subscribed successfully";
    },
    unsubscribeFrom: async (_parent, { userId, authorId }, { prisma }) => {
      //- remove subscription logic here
      return "Unsubscribed successfully";
    },
  },
  User: {
    posts: async (user, _args, { prisma }) => prisma.post.findMany({ where: { authorId: user.id } }),
    profile: async (user, _args, { prisma }) => prisma.profile.findUnique({ where: { userId: user.id } }),
    userSubscribedTo: async (user, _args, { prisma }) => prisma.user.findMany({ where: { subscribedToUser: { some: { id: user.id } } } }),
    subscribedToUser: async (user, _args, { prisma }) => prisma.user.findMany({ where: { userSubscribedTo: { some: { id: user.id } } } }),
  },
  Profile: {
    memberType: async (profile, _args, { prisma }) => prisma.memberType.findUnique({ where: { id: profile.memberTypeId } }),
  },
};

//- create an executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  fastify.route({
    url: '/',
    method: 'GET',
    schema: {
      response: {
        200: Type.Array(memberTypeSchema),
      },
    },
    async handler() {
      return prisma.memberType.findMany();
    },
  });

  fastify.route({
    url: '/:memberTypeId',
    method: 'GET',
    schema: {
      ...getMemberTypeByIdSchema,
      response: {
        200: memberTypeSchema,
        404: Type.Null(),
      },
    },
    async handler(req) {
      const memberType = await prisma.memberType.findUnique({
        where: {
          id: req.params.memberTypeId,
        },
      });
      if (memberType === null) {
        throw httpErrors.notFound();
      }
      return memberType;
    },
  });
};

export default plugin;
