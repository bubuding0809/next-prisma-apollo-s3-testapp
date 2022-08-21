import Layout from "../components/Layout";
import { PrismaClient, Prisma, User, Post, Profile } from "@prisma/client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const prisma = new PrismaClient();

export async function getServerSideProps() {
  const users: User[] = await prisma.user.findMany();

  return {
    props: {
      users: JSON.parse(JSON.stringify(users)),
    },
  };
}

const IndexPage = ({ users }) => {
  const [userData, setUserData] = useState<User[]>(users);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      await getUsersService();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getUsersService = async () => {
    try {
      const response = await fetch("/api/getUsers");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateNewUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/createUser", {
        method: "POST",
        body: JSON.stringify(newUserForm),
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
    setNewUserForm({
      name: "",
      email: "",
    });
    await getUsersService();
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
    <Layout title="Home | Next.js + TypeScript Example">
      <h1>Hello Next.js 👋</h1>
      <div className="flex flex-col bg-stone-400 p-4">
        {userData.map(user => {
          return (
            <div key={user.id} className="flex flex-col p-4 bg-white my-2">
              <div className="flex">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-sm">{user.email}</p>
                  <p className="text-sm"></p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
        <button className=" bg-orange-400 rounded-xl w-40" type="submit">
          Create User
        </button>
      </form>
    </Layout>
  );
};

export default IndexPage;
