import React from "react";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import { DeskController } from "../components/DeskController";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DeskController>
      <Component {...pageProps} />
    </DeskController>
  );
}

export default MyApp;
