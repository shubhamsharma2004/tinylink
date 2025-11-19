import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { burstConfetti } from "../../components/simpleConfetti";
import { ThemeContext } from "../_app";

export default function CodeStats() {
  const router = useRouter();
  const { code } = router.query;
  const theme = useContext(ThemeContext);

  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/links/${code}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed");
        return res.json();
      })
      .then((data) => {
        setLink(data);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [code]);

  async function handleDelete() {
    if (!confirm("Delete this link?")) return;
    const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
    if (res.ok) {
      window.tinyLinkToast?.({ title: "Deleted", message: `${code} removed`, type: "success" });
      router.push("/");
    } else {
      const j = await res.json().catch(() => ({}));
      window.tinyLinkToast?.({ title: "Delete failed", message: j.error || "Could not delete", type: "error" });
    }
  }

  function handleCopy() {
    const short = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${link.code}`;
    navigator.clipboard.writeText(short);
    window.tinyLinkToast?.({ title: "Copied", message: short, type: "success" });
    burstConfetti(window.innerWidth * 0.6, window.innerHeight * 0.2);
  }

  if (loading) return <div className="p-6 max-w-3xl mx-auto">Loading…</div>;
  if (error) return <div className="p-6 max-w-3xl mx-auto text-red-600">{error}</div>;
  if (!link) return <div className="p-6 max-w-3xl mx-auto">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Stats — <span className="text-indigo-600">{link.code}</span></h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => theme.toggle()}
              className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 border hover:opacity-90"
            >
              {theme.dark ? "Light" : "Dark"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1 rounded bg-white/60 dark:bg-gray-800 border"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
          <div className="mb-3">
            <label className="text-sm text-gray-400">Target</label>
            <div className="mt-1 text-indigo-500 break-words">{link.target}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Clicks</label>
              <div className="text-lg font-medium">{link.clicks}</div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Last clicked</label>
              <div className="text-lg">{link.lastClicked ? new Date(link.lastClicked).toLocaleString() : "Never"}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
            >
              Copy Short URL
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
