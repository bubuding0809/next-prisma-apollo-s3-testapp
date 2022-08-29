import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { User } from "./User";

export const Image = objectType({
  name: "Image",
  definition(t) {
    t.int("id");
    t.string("url");
    t.string("description");
    t.int("userId");
    t.field("user", {
      type: User,
      async resolve(parent, _args, ctx) {
        return await ctx.prisma.image
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

export const ImageQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("image", {
      type: Image,
      args: {
        id: intArg(),
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.image.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });
    t.nonNull.list.field("allImages", {
      type: Image,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.image.findMany();
      },
    });
    t.nonNull.list.field("userImagesById", {
      type: Image,
      args: {
        userId: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.image.findMany({
          where: {
            userId: args.userId,
          },
          orderBy: {
            id: "desc",
          },
        });
      },
    });
    t.nonNull.list.field("userImagesByEmail", {
      type: Image,
      args: {
        email: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.user
          .findUnique({
            where: {
              email: args.email,
            },
          })
          .images({
            orderBy: {
              id: "desc",
            },
          });
      },
    });
  },
});

export const ImageMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createImagebyId", {
      type: Image,
      args: {
        url: nonNull(stringArg()),
        description: stringArg(),
        userId: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.image.create({
          data: {
            url: args.url,
            description: args.description,
            user: {
              connect: {
                id: args.userId,
              },
            },
          },
        });
      },
    });
    t.field("createImagebyEmail", {
      type: Image,
      args: {
        url: nonNull(stringArg()),
        description: stringArg(),
        email: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.image.create({
          data: {
            url: args.url,
            description: args.description,
            user: {
              connect: {
                email: args.email,
              },
            },
          },
        });
      },
    });
    t.field("updateImage", {
      type: Image,
      args: {
        id: nonNull(intArg()),
        url: nonNull(stringArg()),
        description: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.image.update({
          where: {
            id: args.id,
          },
          data: {
            url: args.url,
            description: args.description,
          },
        });
      },
    });
    t.field("deleteImage", {
      type: Image,
      args: {
        id: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.image.delete({
          where: {
            id: args.id,
          },
        });
      },
    });
  },
});
