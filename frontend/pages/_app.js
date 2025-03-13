import Head from "next/head";
import "@/styles/globals.css";
import { AuthProvider } from "@/utils/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Toko Kelontong</title>
        <link rel="icon" href="/icon_kelontong.svg" /> // Not loaded
      </Head>
      {/* <AuthProvider> */}
      <Component {...pageProps} />
      {/* </AuthProvider> */}
      <ToastContainer />
    </>
  );
}
