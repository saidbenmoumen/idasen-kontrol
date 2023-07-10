import React from "react";
import Head from "next/head";
import Core from "../components/Core";
import { useController } from "../components/DeskController/useController";
import { Connect } from "../layouts/Connect";
import { Desk } from "../layouts/Desk";

function Home() {
  const {
    state: { device },
  } = useController();

  return (
    <React.Fragment>
      <Head>
        <title>IDASEN kontrol</title>
      </Head>
      <Core title="IDASEN control">
        {device !== null ? <Desk /> : <Connect />}
      </Core>
    </React.Fragment>
  );
}

export default Home;
