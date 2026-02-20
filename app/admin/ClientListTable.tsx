"use client";

import { useState } from "react";

interface ClientSummary {
  id: number;
  name: string;
  slug: string;
  portal_token: string;
  location: string;
  overall_health: string;
  updated_at: string;
  last_accessed_at: string | null;
}

const healthBadge: Record<string, { bg: string; text: string; label: string }> = {
  "on-track": { bg: "bg-emerald-100", text: "text-emerald-800", label: "On Track" },
  "needs-work": { bg: "bg-amber-100", text: "text-amber-800", label: "Needs Work" },
  "critical": { bg: "bg-red-100", text: "text-red-800", label: "Critical" },
};

function getPortalUrl(token: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/portal/${token}`;
  }
  return `/portal/${token}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function ClientListTable({ clients }: { clients: ClientSummary[] }) {
  const [copied, setCopied] = useState<number | null>(null);

  function copyPortalLink(token: string, id: number) {
    navigator.clipboard.writeText(getPortalUrl(token));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 text-sm">No clients yet.</p>
        <a
          href="/admin/clients/new"
          className="inline-block mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800"
        >
          Create First Client
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-5 py-3 font-semibold text-slate-600">Client</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600">Location</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600">Health</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600">Last Viewed</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600">Portal Link</th>
            <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const badge = healthBadge[client.overall_health] || healthBadge["on-track"];
            return (
              <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{client.name}</p>
                  <p className="text-xs text-slate-400">{client.slug}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{client.location}</td>
                <td className="px-5 py-4">
                  <span className={`${badge.bg} ${badge.text} text-xs font-semibold px-2 py-1 rounded-full`}>
                    {badge.label}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {timeAgo(client.last_accessed_at)}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => copyPortalLink(client.portal_token, client.id)}
                    className="text-xs font-mono bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                  >
                    {copied === client.id ? "Copied!" : "Copy Link"}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <a
                    href={`/admin/clients/${client.id}`}
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Edit
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
