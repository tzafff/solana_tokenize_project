import {AppProps} from 'next/app'
import '@/styles/global.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-loading-skeleton/dist/skeleton.css'
import AppWalletProvider from "@/components/AppWalletProvider";
import {ToastContainer} from "react-toastify";

export default function MyApp({Component, pageProps}: AppProps) {
  return (
    <AppWalletProvider>
      <Component {...pageProps} />
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AppWalletProvider>
  )
}
