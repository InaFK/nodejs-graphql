import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { getMemberTypeByIdSchema, memberTypeSchema } from './schemas.js';
import { makeExecutableSchema } from '@graphql-tools/schema';

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

//- create an executable schema
const schema = makeExecutableSchema({
  typeDefs,
  // resolvers,
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
