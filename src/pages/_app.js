import { Provider } from "react-redux";
import { store } from "../app/store";
import "../styles/globals.css";
import { SessionProvider as AuthProvider } from "next-auth/react";

const MyApp = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <AuthProvider session={session}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </AuthProvider>
  );
};

export default MyApp;
