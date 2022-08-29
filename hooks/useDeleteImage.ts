import { gql } from "@apollo/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apolloClient from "../backend/utils/apollo";

export const mutation = gql`
  mutation DeleteImage($deleteImageId: Int!) {
    deleteImage(id: $deleteImageId) {
      id
      url
      description
      userId
    }
  }
`;

const deleteImage = variables => {
  return apolloClient
    .mutate({
      mutation,
      variables,
    })
    .then(({ data }) => data.deleteImage);
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteImage, {
    onMutate: async deletedImage => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(["userImages"]);

      // Snapshot the current state of the cache
      const prevImages = queryClient.getQueriesData(["userImages"]);

      // Remove the deleted image from the cache
      queryClient.setQueriesData(["userImages"], (prev: any) =>
        prev.filter(image => image.id !== deletedImage.deleteImageId)
      );

      return {
        prevImages,
      };
    },
    onError: (err, _deletedImage, ctx) => {
      console.log("Error mutating, reverting back to old state", err);
      queryClient.setQueriesData(["userImages"], ctx.prevImages);
    },
    onSettled: data => {
      queryClient.invalidateQueries(["userImages"]);
    },
  });
};
