import { makeSchema } from "nexus";
import * as types from "./types";
import * as path from "path";

export const schema = makeSchema({
  types: types,
  outputs: {
    typegen: path.join(
      process.cwd(),
      "node_modules/@types/nexus-typegen/index.d.ts"
    ),
    schema: path.join(process.cwd(), "graphql/schema.graphql"),
  },
  contextType: {
    export: "Context",
    module: path.join(process.cwd(), "graphql/context.ts"),
  },
});
