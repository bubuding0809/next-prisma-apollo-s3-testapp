import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import apolloClient from "../backend/utils/apollo";
import { useUser } from "@auth0/nextjs-auth0";
import Head from "next/head";

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

const createUserMutation = gql`
  mutation Mutation($name: String, $email: String, $bio: String) {
    createUser(name: $name, email: $email, bio: $bio) {
      id
      name
      email
      profile {
        bio
      }
    }
  }
`;

const deleteUserMutation = gql`
  mutation DeleteUser($deleteUserId: Int!) {
    deleteUser(id: $deleteUserId) {
      id
      name
      email
    }
  }
`;

export async function getServerSideProps({ req, res }) {
  // const session = getSession(req, res);

  // if (!session) {
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: "/api/auth/login",
  //     },
  //     props: {},
  //   };
  // }

  const { data } = await apolloClient.query({
    query: allUsersQuery,
    variables: { first: 10, after: null },
  });

  return {
    props: {
      users: data.users,
    },
  };
}

const IndexPage = ({ users }) => {
  const { user } = useUser();
  const { data, refetch, fetchMore } = useQuery(allUsersQuery, {
    variables: { first: 10 },
  });
  const [createUser, { data: newUserData }] = useMutation(createUserMutation);
  const [deleteUser, { data: deletedUserData }] =
    useMutation(deleteUserMutation);
  const [userData, setUserData] = useState(users);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    bio: "",
  });
  const { endCursor, hasNextPage } = data
    ? data.users.pageInfo
    : { endCursor: null, hasNextPage: false };

  useEffect(() => {
    // If data changes update the ui state
    if (data) {
      setUserData(data.users);
    }
  }, [data]);

  useEffect(() => {
    // If user makes a mutation refetch the users data
    refetch();
  }, [newUserData, deletedUserData]);

  const handleCreateNewUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, email, bio } = newUserForm;

    if (!name || !email) {
      return alert("Please fill in name and email");
    }

    createUser({
      variables: {
        name,
        email,
        bio,
      },
    });

    setNewUserForm({
      name: "",
      email: "",
      bio: "",
    });
  };

  const handleFormChange: React.ChangeEventHandler<HTMLInputElement> = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewUserForm(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <Head>
        <title>Home</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {user && (
        <form
          onSubmit={handleCreateNewUser}
          className="flex flex-col gap-1 p-4 items-center"
        >
          <div className="w-full">
            <label htmlFor="user-username" className="text-sm">
              Username
            </label>
            <input
              id="user-username"
              className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
              name="name"
              type="text"
              onChange={handleFormChange}
              value={newUserForm.name}
            />
          </div>
          <div className="w-full">
            <label htmlFor="user-email" className="text-sm">
              Email
            </label>
            <input
              id="user-email"
              className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
              name="email"
              type="email"
              onChange={handleFormChange}
              value={newUserForm.email}
            />
          </div>
          <div className="w-full">
            <label htmlFor="user-bio" className="text-sm">
              Profile bio
            </label>
            <input
              id="user-bio"
              className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
              name="bio"
              type="text"
              onChange={handleFormChange}
              value={newUserForm.bio}
            />
          </div>
          <button className=" bg-orange-400 rounded-xl w-40" type="submit">
            Create User
          </button>
        </form>
      )}
      <div className="flex flex-col bg-stone-400 p-4">
        {userData.edges.map(({ node }) => {
          return (
            <div key={node.id} className="flex flex-col p-4 bg-white my-2">
              <div className="flex gap-1 justify-between">
                <div>
                  <span>id: {node.id}</span>
                  <h2 className="text-2xl font-bold">{node.name}</h2>
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
                {user && (
                  <div>
                    <button
                      onClick={() => {
                        deleteUser({
                          variables: {
                            deleteUserId: parseInt(node.id),
                          },
                        });
                      }}
                      className="bg-slate-50 border rounded px-4 py-2 hover:scale-110 hover:shadow-inner"
                    >
                      Delete
                    </button>
                  </div>
                )}
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
    </>
  );
};

export default IndexPage;
