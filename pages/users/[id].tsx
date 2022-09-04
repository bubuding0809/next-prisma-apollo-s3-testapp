import { GetServerSideProps } from "next";
import { User, Profile } from "@prisma/client";
import Head from "next/head";

type Props = {
  user?: User & { profile: Profile };
  errors?: string;
};

const StaticPropsDetail = ({ user, errors }: Props) => {
  if (errors) {
    return (
      <>
        <Head>
          <title>Error</title>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <p>
          <span style={{ color: "red" }}>Error:</span> {errors}
        </p>
      </>
    );
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div>
        <h1>id: {user.id}</h1>
        <h1>{user.name}</h1>
        <p>Email: {user.email}</p>
        {user.profile && <p>{user.profile}</p>}
      </div>
    </>
  );
};

export default StaticPropsDetail;

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const id = ctx.params.id;
    if (typeof id !== "string") {
      throw new Error("id is not a string");
    }
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { profile: true },
    });
    if (!user) throw new Error("Cannot find user");
    return { props: { user } };
  } catch (err: any) {
    return { props: { errors: err.message } };
  }
};
