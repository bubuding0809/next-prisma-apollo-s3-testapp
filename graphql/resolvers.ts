import { Context } from "../graphql/context";

export const resolvers = {
  Query: {
    user: async (_parent, args, ctx: Context) => {
      return await ctx.prisma.user.findUnique({
        where: {
          id: args.id,
        },
      });
    },

    users: async (_parent, _args, ctx: Context) => {
      return await ctx.prisma.user.findMany({
        include: {
          profile: true,
        },
      });
    },

    profile: async (_parent, args, ctx: Context) => {
      return await ctx.prisma.profile.findUnique({
        where: {
          id: args.id,
        },
        include: {
          user: true,
        },
      });
    },
  },
};
