import { useEffect, useState } from "react";

let enqueueFn = null;

// expose a simple global function to create toasts
if (typeof window !== "undefined") {
  window.tinyLinkToast = (opts) => {
    if (enqueueFn) enqueueFn(opts);
  };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    enqueueFn = (opts) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((t) => [...t, { id, ...opts }]);
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id));
      }, (opts?.duration ?? 3000));
    };
    return () => { enqueueFn = null; };
  }, []);

  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-sm px-4 py-2 rounded-lg shadow-lg transform transition-all
            ${t.type === "error" ? "bg-red-600 text-white" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"}`}
        >
          <div className="font-medium">{t.title}</div>
          {t.message && <div className="text-sm mt-1 opacity-90">{t.message}</div>}
        </div>
      ))}
    </div>
  );
}
    