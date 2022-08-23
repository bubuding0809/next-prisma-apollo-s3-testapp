import React, { ReactNode } from "react";
import Link from "next/link";
import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "This is the default title" }: Props) => {
  const { user } = useUser();
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Head>
          <title>{title}</title>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <header className="bg-slate-50 shadow-md h-10 p-2">
          <nav>
            <Link href="/">
              <a>Home</a>
            </Link>{" "}
            |{" "}
            <Link href="/about">
              <a>About</a>
            </Link>{" "}
            |{" "}
            <Link href="/users">
              <a>Users List</a>
            </Link>{" "}
            | <a href="/api/defaultUsers">Users API</a>
          </nav>
        </header>
        <div className="min-h-full justify-self-stretch p-2">{children}</div>
      </div>
      <footer className="flex justify-center items-center bg-slate-50 h-10 bottom-0">
        <hr />
        <span>I'm here to stay (Footer)</span>
      </footer>
    </div>
  );
};

export default Layout;
