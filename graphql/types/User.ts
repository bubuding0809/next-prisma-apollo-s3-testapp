import { enumType, extendType, intArg, objectType, stringArg } from "nexus";
import { Profile } from "./Profile";

export const User = objectType({
  name: "User",
  definition(t) {
    t.int("id");
    t.string("name");
    t.string("email");
    t.field("profile", {
      type: Profile,
      async resolve(parent, _args, ctx) {
        return await ctx.prisma.user
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .profile();
      },
    });
    t.nonNull.list.field("posts", {
      type: "Post",
      async resolve(parent, _args, ctx) {
        return await ctx.prisma.user
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .posts();
      },
    });
  },
});

export const Edge = objectType({
  name: "Edge",
  definition(t) {
    t.string("cursor");
    t.field("node", {
      type: User,
    });
  },
});

export const PageInfo = objectType({
  name: "PageInfo",
  definition(t) {
    t.string("endCursor");
    t.boolean("hasNextPage");
  },
});

export const Response = objectType({
  name: "Response",
  definition(t) {
    t.field("pageInfo", {
      type: PageInfo,
    });
    t.list.field("edges", {
      type: Edge,
    });
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("user", {
      type: User,
      args: {
        id: "Int",
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.user.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });
  },
});

// export const UsersQuery = extendType({
//   type: "Query",
//   definition(t) {
//     t.nonNull.list.field("users", {
//       type: User,
//       async resolve(_parent, _args, ctx) {
//         return await ctx.prisma.user.findMany();
//       },
//     });
//   },
// });

export const UsersQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("users", {
      type: Response,
      args: {
        first: intArg(),
        after: intArg(),
      },
      async resolve(_parent, args, ctx) {
        let queryResults = null;

        if (args.after) {
          queryResults = await ctx.prisma.user.findMany({
            take: args.first,
            skip: 1,
            cursor: {
              id: args.after,
            },
            orderBy: {
              id: "desc",
            },
          });
        } else {
          queryResults = await ctx.prisma.user.findMany({
            take: args.first,
            orderBy: {
              id: "desc",
            },
          });
        }

        if (queryResults.length > 0) {
          const lastUserInResults = queryResults[queryResults.length - 1];
          const myCursor = lastUserInResults.id;

          const secondQueryResults = await ctx.prisma.user.findMany({
            take: args.first,
            cursor: {
              id: myCursor,
            },
            orderBy: {
              id: "desc",
            },
          });

          console.log(secondQueryResults);
          return {
            pageInfo: {
              endCursor: myCursor,
              hasNextPage: secondQueryResults.length > 1,
            },
            edges: queryResults.map(user => ({
              cursor: user.id,
              node: user,
            })),
          };
        }

        return {
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
          edges: [],
        };
      },
    });
  },
});

export const UsersMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createUser", {
      type: User,
      args: {
        name: "String",
        email: "String",
        bio: "String",
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.user.create({
          data: {
            name: args.name,
            email: args.email,
            profile: {
              create: {
                bio: args.bio,
              },
            },
          },
        });
      },
    });
  },
});
