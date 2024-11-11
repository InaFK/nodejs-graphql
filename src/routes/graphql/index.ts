import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';
import resolvers from './resolvers.js';
import { MemberType, MemberTypeListType } from './member.js';
import { User, UserList } from './users.js';
import { Post, Posts } from './posts.js';
import { Profile, ProfileList } from './profile.js';
import { createPost, changePost, deletePost } from './services/postHelpers.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      return graphql({
        schema,
        source: req.body.query,
        contextValue: { 
          prisma,
          createPost,
          changePost,
          deletePost
         },
        variableValues: req.body.variables,
      });
    },
  });

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQuery',
      fields: {
        memberTypes: {
          type: MemberTypeListType,
          resolve: resolvers.RootQueryType.memberTypes,
        },
        memberType: {
          type: MemberType,
          args: { id: { type: resolvers.UUID } },
          resolve: resolvers.RootQueryType.memberType,
        },
        users: {
          type: UserList,
          resolve: resolvers.RootQueryType.users,
        },
        user: {
          type: User,
          args: { id: { type: resolvers.UUID } },
          resolve: resolvers.RootQueryType.user,
        },
        posts: {
          type: Posts,
          resolve: resolvers.RootQueryType.posts,
        },
        post: {
          type: Post,
          args: { id: { type: resolvers.UUID } },
          resolve: resolvers.RootQueryType.post,
        },
        profiles: {
          type: ProfileList,
          resolve: resolvers.RootQueryType.profiles,
        },
        profile: {
          type: Profile,
          args: { id: { type: resolvers.UUID } },
          resolve: resolvers.RootQueryType.profile,
        },
      },
    }),
  });
};

export default plugin;