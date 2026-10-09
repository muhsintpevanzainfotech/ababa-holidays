import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App.tsx";
import LoadingScreen from "./components/LoadingScreen";
import "./index.css";

const RootApp = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <LoadingScreen visible={loading} />
        <App />
      </ThemeProvider>
    </Provider>
  );
};

createRoot(document.getElementById("root")!).render(<RootApp />);
