import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./_app";
import { burstConfetti } from "../components/simpleConfetti";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default function Dashboard() {
  const theme = useContext(ThemeContext);

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    if (!target) return setError("Target URL required");
    if (code && !CODE_REGEX.test(code))
      return setError("Code must be 6-8 alphanumeric chars");

    setSubmitting(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          code: code || undefined,
        }),
      });

      if (res.status === 409) {
        const { error } = await res.json();
        throw new Error(error || "Code already exists");
      }

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to create link");
      }

      const created = await res.json();

      setTarget("");
      setCode("");
      fetchLinks();

      const short = `${process.env.NEXT_PUBLIC_BASE_URL}/${created.code}`;
      navigator.clipboard.writeText(short);

      // TOAST + CONFETTI
      window.tinyLinkToast?.({
        title: "Short link created!",
        message: short,
        type: "success",
      });

      burstConfetti(window.innerWidth * 0.6, window.innerHeight * 0.3);
    } catch (err) {
      setError(err.message);
      window.tinyLinkToast?.({
        title: "Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(c) {
    if (!confirm("Delete this link?")) return;

    await fetch(`/api/links/${c}`, { method: "DELETE" });
    fetchLinks();

    window.tinyLinkToast?.({
      title: "Deleted",
      message: `${c} removed`,
      type: "success",
    });
  }

  const filtered = links.filter((l) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      l.code.toLowerCase().includes(q) ||
      l.target.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-6 animate-fadeIn">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 animate-slideDown">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
            TinyLink Dashboard
          </h1>

          <button
            onClick={() => theme.toggle()}
            className="px-4 py-2 rounded-xl bg-white/70 dark:bg-gray-800 backdrop-blur shadow hover:bg-white/90 dark:hover:bg-gray-700 transition"
          >
            {theme.dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* CREATE FORM */}
        <form
          onSubmit={handleCreate}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/40 mb-8 space-y-4 animate-fadeUp"
        >
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Create a short link
          </h2>

          <input
            className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 transition dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
            placeholder="Target URL"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />

          <input
            className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 transition dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
            placeholder="Custom code (optional)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {error && (
            <p className="text-red-500 text-sm animate-pulse">{error}</p>
          )}

          <button
            disabled={submitting}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition active:scale-95"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </form>

        {/* SEARCH */}
        <div className="mb-4 animate-fadeUp">
          <input
            placeholder="Search by code or URL"
            className="p-3 border rounded-xl w-full shadow-sm focus:ring-2 focus:ring-indigo-400 transition dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/40 dark:border-gray-700 animate-fadeUp">
          <table className="w-full">
            <thead className="bg-gray-100/80 dark:bg-gray-900/50">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">Code</th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">Target</th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">Clicks</th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">Last clicked</th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No links found
                  </td>
                </tr>
              )}

              {filtered.map((l) => (
                <tr
                  key={l.code}
                  className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <td className="p-3 text-indigo-600 font-medium">
                    <a
                      href={`/${l.code}`}
                      target="_blank"
                      className="hover:underline"
                    >
                      {l.code}
                    </a>
                  </td>

                  <td className="p-3 max-w-xs truncate text-gray-700 dark:text-gray-300" title={l.target}>
                    {l.target}
                  </td>

                  <td className="p-3 dark:text-gray-200">{l.clicks}</td>

                  <td className="p-3 dark:text-gray-200">
                    {l.lastClicked
                      ? new Date(l.lastClicked).toLocaleString()
                      : "—"}
                  </td>

                  <td className="p-3 space-x-2">
                    <button
                      className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:border-gray-600 dark:text-gray-200"
                      onClick={() => {
                        const short = `${process.env.NEXT_PUBLIC_BASE_URL}/${l.code}`;
                        navigator.clipboard.writeText(short);
                        window.tinyLinkToast?.({ title: "Copied!", message: short, type: "success" });
                        burstConfetti(window.innerWidth * 0.6, window.innerHeight * 0.2);
                      }}
                    >
                      Copy
                    </button>

                    <button
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm shadow hover:bg-indigo-700 transition"
                      onClick={() => (window.location.href = `/code/${l.code}`)}
                    >
                      Stats
                    </button>

                    <button
                      className="px-3 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-sm transition"
                      onClick={() => handleDelete(l.code)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-fadeUp">
          Healthcheck: <a className="text-indigo-600 hover:underline" href="/healthz">/healthz</a>
        </p>
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fadeIn { animation: fadeIn .6s ease-in-out; }
          .animate-fadeUp { animation: fadeUp .6s ease-out; }
          .animate-slideDown { animation: slideDown .6s ease-out; }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
