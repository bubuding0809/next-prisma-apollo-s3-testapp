import { gql } from "@apollo/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apolloClient from "../backend/utils/apollo";

const mutation = gql`
  mutation CreateImagebyEmail(
    $url: String!
    $email: String!
    $description: String
  ) {
    createImagebyEmail(url: $url, email: $email, description: $description) {
      id
      url
      description
      userId
    }
  }
`;

const createImagebyEmail = variables => {
  return apolloClient
    .mutate({
      mutation,
      variables,
    })
    .then(({ data }) => data.createImagebyEmail);
};

export const useCreateImage = () => {
  const queryClient = useQueryClient();
  return useMutation(createImagebyEmail, {
    onMutate: async newImage => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(["userImages"]);

      // Snapshot the current state of the cache
      const prevImages = queryClient.getQueriesData(["userImages"]);

      // Add the new image to the cache
      queryClient.setQueriesData(["userImages"], (prev: any) => [
        newImage,
        ...prev,
      ]);

      return {
        prevImages,
      };
    },
    onError: (_err, _newImage, ctx) => {
      queryClient.setQueriesData(["userImages"], ctx.prevImages);
    },
    onSettled: data => {
      queryClient.invalidateQueries(["userImages"]);
    },
  });
};
