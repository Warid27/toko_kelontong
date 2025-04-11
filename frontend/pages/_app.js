import Head from "next/head";
import "@/styles/globals.css";
import dynamic from "next/dynamic";
import AuthGuard from "@/utils/AuthGuard";

const DynamicToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <AuthGuard>
      <Head>
        <title>Toko Kelontong</title>
        <link rel="icon" type="image/svg+xml" href="/icon_kelontong.svg" />
      </Head>
      <Component {...pageProps} />
      <DynamicToastContainer />
    </AuthGuard>
  );
}
