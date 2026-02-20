import { getAllClients } from "@/app/lib/db";
import AdminShell from "../../AdminShell";
import NewClientForm from "./NewClientForm";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const allClients = await getAllClients();
  const sidebarClients = allClients.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <AdminShell clients={sidebarClients}>
      <NewClientForm />
    </AdminShell>
  );
}
