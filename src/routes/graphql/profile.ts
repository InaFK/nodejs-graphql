import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLID,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberType, MemberTypeId } from './member.js';
  
export const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (parent, _, context) => {
        return context.prisma.memberType.findUnique({
          where: { id: parent.memberTypeId },
        });
      },
    },
  },
});
  
export const ProfileList = new GraphQLList(Profile);

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  },
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeId },
  },
});

export const ProfileMutations = {
  createProfile: {
    type: Profile,
    args: {
      dto: { type: new GraphQLNonNull(CreateProfileInput) },
    },
    resolve: async (_, { dto }, {createProfile}) => {
      return await createProfile(dto);
    },
  },
  changeProfile: {
    type: Profile,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
      dto: { type: new GraphQLNonNull(ChangeProfileInput) },
    },
    resolve: async (_, { id, dto }, {changeProfile}) => {
      return await changeProfile(id, dto);
    },
  },
  deleteProfile: {
    type: GraphQLID,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_, { id }, {deleteProfile}) => {
      await deleteProfile(id);
      return id;
    },
  },
};