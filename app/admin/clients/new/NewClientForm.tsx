"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [tagline, setTagline] = useState("");
  const [primary, setPrimary] = useState("#333333");
  const [secondary, setSecondary] = useState("#333333");
  const [accent, setAccent] = useState("#666666");

  function autoSlug(n: string) {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || autoSlug(name),
          location,
          tagline: tagline || undefined,
          brandColor: primary,
          brandTheme: {
            primary,
            primaryLight: primary + "30",
            secondary,
            accent,
            accentLight: accent + "60",
            bg: "#FAFAFA",
            cardBg: "#FFFFFF",
            textDark: secondary,
            muted: "#8A8A8A",
          },
        }),
      });

      if (res.ok) {
        const { client } = await res.json();
        router.push(`/admin/clients/${client.id}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create client");
      }
    } catch {
      setError("Something went wrong");
    }

    setSaving(false);
  }

  const inputCls = "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Client</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-xl space-y-4">
        <div>
          <label className={labelCls}>Client Name *</label>
          <input className={inputCls} value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)); }} placeholder="e.g. Gud2Go Cafe" required />
        </div>

        <div>
          <label className={labelCls}>Slug</label>
          <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated from name" />
          <p className="text-xs text-slate-400 mt-1">Used for internal reference. Auto-generated if left blank.</p>
        </div>

        <div>
          <label className={labelCls}>Location *</label>
          <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Pomona, CA" required />
        </div>

        <div>
          <label className={labelCls}>Tagline</label>
          <input className={inputCls} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Brunch. Grab. Go" />
        </div>

        <div className="pt-2">
          <p className="text-sm font-medium text-slate-700 mb-3">Brand Colors</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500">Primary</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <input className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs font-mono" value={primary} onChange={(e) => setPrimary(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Secondary</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <input className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs font-mono" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Accent</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <input className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs font-mono" value={accent} onChange={(e) => setAccent(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="pt-2 flex gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
            {saving ? "Creating..." : "Create Client"}
          </button>
          <a href="/admin" className="px-4 py-2 text-slate-600 text-sm font-medium hover:text-slate-900">Cancel</a>
        </div>
      </form>
    </div>
  );
}
