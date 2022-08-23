import { enumType, extendType, objectType } from "nexus";
import { User } from "./User";

export const Profile = objectType({
  name: "Profile",
  definition(t) {
    t.int("id");
    t.string("bio");
    t.int("userId");
    t.field("user", {
      type: User,
      async resolve(parent, _args, ctx) {
        return await ctx.prisma.profile
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .user();
      },
    });
  },
});

export const ProfileQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("profile", {
      args: {
        id: "Int",
      },
      type: Profile,
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.profile.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });
  },
});

export const ProfilesQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("profiles", {
      type: Profile,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.profile.findMany({
          include: {
            user: true,
          },
        });
      },
    });
  },
});

export const ProfilesMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createProfile", {
      type: Profile,
      args: {
        bio: "String",
        email: "String",
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.profile.create({
          data: {
            bio: args.bio,
            user: {
              connectOrCreate: {
                where: {
                  email: args.email,
                },
                create: {
                  name: "Anonymous",
                  email: args.email,
                },
              },
            },
          },
        });
      },
    });
  },
});
