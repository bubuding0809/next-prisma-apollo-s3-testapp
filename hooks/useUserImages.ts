import { useQuery } from "@tanstack/react-query";
import { gql } from "@apollo/client";
import apolloClient from "../backend/utils/apollo";

export const query = gql`
  query UserImagesByEmail($email: String!) {
    userImagesByEmail(email: $email) {
      id
      url
      description
      userId
    }
  }
`;

const getUserImagesByEmail = variables => {
  return apolloClient
    .query({
      query,
      variables,
    })
    .then(({ data }) => data.userImagesByEmail);
};

export const useUserImages = variables => {
  return useQuery(["userImages"], async () => getUserImagesByEmail(variables));
};
