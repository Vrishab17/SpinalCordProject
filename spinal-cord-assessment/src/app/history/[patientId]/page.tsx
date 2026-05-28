import AuthGuard from "@/components/AuthGuard";
import HistoryPageClient from "./HistoryPageClient";

export default function Page() {
  return (
    <AuthGuard>
      <HistoryPageClient />
    </AuthGuard>
  );
}
