import { getClientById, getAllClients } from "@/app/lib/db";
import { notFound } from "next/navigation";
import AdminShell from "../../AdminShell";
import ClientEditor from "./ClientEditor";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(Number(id));

  if (!client) notFound();

  const allClients = await getAllClients();
  const sidebarClients = allClients.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <AdminShell clients={sidebarClients}>
      <ClientEditor client={client} />
    </AdminShell>
  );
}
