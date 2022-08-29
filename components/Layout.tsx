import React, { ReactNode } from "react";
import Head from "next/head";
import Header from "./Header";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />
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
