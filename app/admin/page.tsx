import { getAllClients } from "@/app/lib/db";
import AdminShell from "./AdminShell";
import ClientListTable from "./ClientListTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let clients: Awaited<ReturnType<typeof getAllClients>> = [];
  let error = "";

  try {
    clients = await getAllClients();
  } catch (e) {
    error = String(e);
  }

  const sidebarClients = clients.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <AdminShell clients={sidebarClients}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""} managed
          </p>
        </div>
        <a
          href="/admin/clients/new"
          className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          + New Client
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          <strong>Database Error:</strong> {error}
          <p className="mt-1 text-red-500">Make sure DATABASE_URL is set in your environment variables.</p>
        </div>
      )}

      <ClientListTable clients={clients} />
    </AdminShell>
  );
}
