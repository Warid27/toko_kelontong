import Head from "next/head";
import "@/styles/globals.css";
import { AuthProvider } from "@/utils/AuthContext";
import dynamic from "next/dynamic";

const DynamicToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Toko Kelontong</title>
        <link rel="icon" type="image/svg+xml" href="/icon_kelontong.svg" />
      </Head>
      {/* <AuthProvider> */}
      <Component {...pageProps} />
      {/* </AuthProvider> */}
      <DynamicToastContainer />
    </>
  );
}
