import { GetServerSideProps } from "next";
import Link from "next/link";
import { User } from "../../interfaces";
import List from "../../components/List";
import Head from "next/head";
import apolloClient from "../../backend/utils/apollo";
import { gql } from "apollo-server-micro";
import { useQuery } from "@apollo/client";
import { useMemo } from "react";

const allUsersQuery = gql`
  query Users($first: Int, $after: Int) {
    users(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          email
          profile {
            bio
          }
          posts {
            id
            title
            content
            published
          }
        }
      }
    }
  }
`;
type Props = {
  items: User[];
};

const WithStaticProps = () => {
  const { data, fetchMore } = useQuery(allUsersQuery, {
    variables: { first: 10 },
  });

  const { endCursor, hasNextPage } = useMemo(
    () =>
      data ? data.users.pageInfo : { endCursor: null, hasNextPage: false },
    [data]
  );

  return (
    <>
      <Head>
        <title>User list</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <h1>Users List</h1>
      <p>You are currently on: /users</p>

      <div className="flex flex-col bg-stone-400 p-4">
        {data &&
          data.users.edges.map(({ node }) => {
            return (
              <div key={node.id} className="flex flex-col p-4 bg-white my-2">
                <div className="flex gap-1 justify-between">
                  <div>
                    <span>id: {node.id} - </span>
                    <Link href={`users/${node.id}`}>
                      <a className="text-2xl font-bold text-blue-500">
                        {node.name}
                      </a>
                    </Link>
                    <p className="text-sm">email: {node.email}</p>
                    {node.profile && (
                      <p className="text-sm">profile bio: {node.profile.bio}</p>
                    )}
                    <div className="flex flex-col gap-1 border rounded">
                      {node.posts.map(post => (
                        <div
                          key={post.id}
                          className="flex flex-col bg-amber-300/30 gap-1 p-2"
                        >
                          <h1 className="font-bold">{post.title}</h1>
                          <p>{post.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      {hasNextPage ? (
        <div className="flex justify-center">
          <button
            onClick={() =>
              fetchMore({
                variables: { after: parseInt(endCursor) },
                updateQuery: (prevResults, { fetchMoreResult }) => ({
                  users: {
                    edges: [
                      ...prevResults.users.edges,
                      ...fetchMoreResult.users.edges,
                    ],
                    pageInfo: fetchMoreResult.users.pageInfo,
                  },
                }),
              })
            }
          >
            Show more...
          </button>
        </div>
      ) : (
        <div>Thats all the user data we have.</div>
      )}

      <p>
        <Link href="/">
          <a>Go home</a>
        </Link>
      </p>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { data } = await apolloClient.query({
    query: allUsersQuery,
    variables: { first: 10, after: null },
  });

  return {
    props: {
      users: data.users,
    },
  };
};

export default WithStaticProps;
