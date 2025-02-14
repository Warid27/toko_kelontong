import Head from "next/head";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Toko Kelontong</title>
        <link rel="icon" href="/icon_kelontong.svg" /> // Not loaded
      </Head>
      <Component {...pageProps} />
    </>
  );
}
