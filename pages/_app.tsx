import "../styles/globals.css";
import React from "react";
import { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../backend/utils/apollo";
import { UserProvider } from "@auth0/nextjs-auth0";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />;
      </ApolloProvider>
    </UserProvider>
  );
}

export default MyApp;
