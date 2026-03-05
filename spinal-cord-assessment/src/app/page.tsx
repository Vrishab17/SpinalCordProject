export default async function HomePage() {
    let result: any = null;
  
    try {
      const res = await fetch("http://localhost:3000/api/test", {
        cache: "no-store",
      });
      result = await res.json();
    } catch (e: any) {
      result = { ok: false, error: e?.message ?? "Fetch failed" };
    }
  
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Home</h1>
  
        <div className="mt-4 rounded border p-4">
          <div className="font-medium">
            Database status:{" "}
            <span className={result?.ok ? "text-green-600" : "text-red-600"}>
              {result?.ok ? "CONNECTED" : "NOT CONNECTED"}
            </span>
          </div>
  
          <pre className="mt-3 overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    );
  }