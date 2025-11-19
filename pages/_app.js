import "../styles/globals.css";
import { useEffect, useState, createContext } from "react";
import ToastContainer from "../components/ToastContainer";

// Make a simple context so pages can call `window.createToast(...)` too if needed
export const ThemeContext = createContext({ dark: false, toggle: () => {} });

function App({ Component, pageProps }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("tiny_dark");
    const prefer = saved ? saved === "1" : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(Boolean(prefer));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tiny_dark", dark ? "1" : "0");
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Component {...pageProps} />
        <ToastContainer />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
