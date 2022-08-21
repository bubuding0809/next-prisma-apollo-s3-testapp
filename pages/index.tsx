import Layout from "../components/Layout";
import { PrismaClient, User } from "@prisma/client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/testapi");
        setUserData(await response.json());
      } catch (error) {
        console.log(error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
                  <p className="text-sm">
                    Created at {new Date(user.createdAt).toDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default IndexPage;
