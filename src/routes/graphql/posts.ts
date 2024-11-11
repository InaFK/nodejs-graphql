import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType
} from 'graphql';
import { UUIDType } from './types/uuid.js';

export const Post = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const Posts = new GraphQLList(new GraphQLNonNull(Post));

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) }
  }
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString }
  }
});

export const PostMutations = {
  createPost: {
    type: Post,
    args: {
      dto: { type: new GraphQLNonNull(CreatePostInput) }
    },
    resolve: async (_, { dto }, { createPost }) => await createPost(dto)
  },

  changePost: {
    type: Post,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
      dto: { type: new GraphQLNonNull(ChangePostInput) }
    },
    resolve: async (_, { id, dto }, { changePost }) => await changePost(id, dto)
  },

  deletePost: {
    type: GraphQLString,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) }
    },
    resolve: async (_, { id }, { deletePost }) => {
      await deletePost(id);
      return "Post deleted successfully";
    }
  }
};
