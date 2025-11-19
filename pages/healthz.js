export default function Health() {
  return (
    <pre>
      {JSON.stringify({ ok: true, version: "1.0" }, null, 2)}
    </pre>
  );
}
