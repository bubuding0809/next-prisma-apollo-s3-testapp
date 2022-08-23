import { extendType, objectType } from "nexus";
import { User } from "./User";

export const Post = objectType({
  name: "Post",
  definition(t) {
    t.int("id");
    t.string("title");
    t.string("content");
    t.boolean("published");
    t.int("authorId");
    t.field("author", {
      type: User,
      async resolve(parent, _args, ctx) {
        return await ctx.prisma.post
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .author();
      },
    });
  },
});

export const PostsQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("posts", {
      type: Post,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.post.findMany();
      },
    });
  },
});

export const PostsMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createPost", {
      type: Post,
      args: {
        title: "String",
        content: "String",
        published: "Boolean",
        authorId: "Int",
      },
      async resolve(_parent, args, ctx) {
        return await ctx.prisma.post.create({
          data: {
            title: args.title,
            content: args.content,
            published: args.published,
            authorId: args.authorId,
          },
        });
      },
    });
  },
});
