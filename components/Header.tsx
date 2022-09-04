// components/Layout/Header.tsx
import React from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";

const Header = () => {
  const { user } = useUser();
  return (
    <header>
      <div className="flex justify-between items-center px-2 py-2 bg-slate-100/50 shadow-md">
        <div>
          <Link href="/">Home </Link>
          <Link href="/about">
            <a>| Images </a>
          </Link>
          <Link href="/users">
            <a>| SSG </a>
          </Link>
        </div>
        <nav className="flex items-center justify-center mr-2">
          {user ? (
            <div className="flex items-center space-x-5">
              <Link href="/api/auth/logout">
                <a className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base">
                  Logout
                </a>
              </Link>
              <img
                alt="profile"
                className="rounded-full w-12 h-12"
                src={user.picture}
              />
            </div>
          ) : (
            <Link href="/api/auth/login">
              <a className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
                Login
              </a>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
