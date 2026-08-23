"use client";

import { Clock3, MapPin, Pencil, Plus, RotateCcw, Store, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { storeFormSchema, toFormErrors, type FormErrors } from "@/lib/admin/form-schemas";
import type { StoreHours } from "@/lib/admin/store-validation";

type StoreRecord = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: StoreHours;
  timezone: string;
  pickupIntervalMinutes: number;
  pickupLeadTimeMinutes: number;
  pickupCapacity: number;
  coordinates: string | null;
  isActive: boolean;
};

const dayLabels: Record<keyof StoreHours, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};
const dayKeys = Object.keys(dayLabels) as Array<keyof StoreHours>;
const fieldClass = "min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3 text-[#3b2116] shadow-sm outline-none transition focus:border-[#a56328] focus:ring-2 focus:ring-[#f5dfba]";

function defaultHours(): StoreHours {
  return Object.fromEntries(dayKeys.map((day) => [day, { open: "07:00", close: "19:00" }])) as StoreHours;
}

function blankStore(): Omit<StoreRecord, "id" | "isActive"> {
  return { name: "", address: "", phone: "", hours: defaultHours(), timezone: "Africa/Addis_Ababa", pickupIntervalMinutes: 20, pickupLeadTimeMinutes: 20, pickupCapacity: 10, coordinates: null };
}

function editable(store: StoreRecord): Omit<StoreRecord, "id" | "isActive"> {
  return { name: store.name, address: store.address, phone: store.phone, hours: store.hours, timezone: "Africa/Addis_Ababa", pickupIntervalMinutes: store.pickupIntervalMinutes, pickupLeadTimeMinutes: store.pickupLeadTimeMinutes, pickupCapacity: store.pickupCapacity, coordinates: store.coordinates };
}

export default function StoreManager({ initialStores }: { initialStores: StoreRecord[] }) {
  const [stores, setStores] = useState(initialStores);
  const [filter, setFilter] = useState<"active" | "archived" | "all">("active");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankStore);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors<Omit<StoreRecord, "id" | "isActive">>>({});
  const [busy, setBusy] = useState(false);
  const visibleStores = useMemo(() => stores.filter((store) => (filter === "all" || (filter === "active" ? store.isActive : !store.isActive)) && `${store.name} ${store.address}`.toLowerCase().includes(query.trim().toLowerCase())), [filter, query, stores]);

  function startCreate() { setEditingId(null); setForm(blankStore()); setError(""); setFormErrors({}); }
  function startEdit(store: StoreRecord) { setEditingId(store.id); setForm(editable(store)); setError(""); setFormErrors({}); }
  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) { setForm((current) => ({ ...current, [key]: value })); }
  function updateHours(day: keyof StoreHours, value: StoreHours[keyof StoreHours]) { setForm((current) => ({ ...current, hours: { ...current.hours, [day]: value } })); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = storeFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormErrors(toFormErrors(parsed.error));
      toast.error("Check the store form", { description: "Correct the highlighted fields and try again." });
      return;
    }
    setError(""); setBusy(true);
    setFormErrors({});
    try {
      const response = await fetch(editingId ? `/api/admin/stores/${editingId}` : "/api/admin/stores", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to save the store.");
      const saved = result.store as StoreRecord;
      setStores((current) => editingId ? current.map((store) => store.id === saved.id ? saved : store) : [saved, ...current]);
      startCreate();
      toast.success(editingId ? "Store updated" : "Store created");
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Unable to save the store."; setError(message); toast.error("Store could not be saved", { description: message }); }
    finally { setBusy(false); }
  }

  async function changeStatus(store: StoreRecord) {
    const action = store.isActive ? "archive" : "restore";
    if (store.isActive && !window.confirm(`Archive ${store.name}? It will no longer be available for new pickup orders.`)) return;
    setError(""); setBusy(true);
    try {
      const response = await fetch(`/api/admin/stores/${store.id}/${action}`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? `Unable to ${action} the store.`);
      setStores((current) => current.map((item) => item.id === store.id ? result.store : item));
      toast.success(store.isActive ? "Store archived" : "Store restored");
    } catch (cause) { const message = cause instanceof Error ? cause.message : `Unable to ${action} the store.`; setError(message); toast.error("Store status could not be changed", { description: message }); }
    finally { setBusy(false); }
  }

  return <section className="mx-auto max-w-6xl space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-semibold text-amber-700">Operations</p><h1 className="mt-1 text-3xl font-bold text-amber-950">Store locations</h1><p className="mt-2 max-w-2xl text-slate-600">Manage locations, Ethiopia-local hours, and the pickup configuration customers see at checkout.</p></div>
      <Button onClick={startCreate} className="min-h-11 rounded-full bg-amber-700 px-5 text-white hover:bg-amber-800"><Plus aria-hidden="true" className="size-4" /> Add store</Button>
    </header>

    <form onSubmit={save} className="rounded-3xl border border-[#ead9bf] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-amber-950">{editingId ? "Edit store" : "Add a store"}</h2><p className="mt-1 text-sm text-slate-600">Hours are interpreted in Africa/Addis_Ababa. Closed days do not offer pickup.</p></div>{editingId && <Button type="button" variant="outline" className="min-h-11" onClick={startCreate}>Cancel edit</Button>}</div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Store name" error={formErrors.name}><input required aria-invalid={Boolean(formErrors.name)} value={form.name} onChange={(event) => updateField("name", event.target.value)} className={fieldClass} /></Field>
        <Field label="Phone" error={formErrors.phone}><input required aria-invalid={Boolean(formErrors.phone)} inputMode="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className={fieldClass} /></Field>
        <Field label="Address" error={formErrors.address} className="md:col-span-2"><input required aria-invalid={Boolean(formErrors.address)} value={form.address} onChange={(event) => updateField("address", event.target.value)} className={fieldClass} /></Field>
        <Field label="Pickup interval (minutes)" error={formErrors.pickupIntervalMinutes}><select aria-invalid={Boolean(formErrors.pickupIntervalMinutes)} value={form.pickupIntervalMinutes} onChange={(event) => updateField("pickupIntervalMinutes", Number(event.target.value))} className={fieldClass}><option value={20}>20 minutes</option><option value={40}>40 minutes</option><option value={60}>60 minutes</option></select></Field>
        <Field label="Lead time (minutes)" error={formErrors.pickupLeadTimeMinutes}><input required aria-invalid={Boolean(formErrors.pickupLeadTimeMinutes)} min={0} max={240} type="number" value={form.pickupLeadTimeMinutes} onChange={(event) => updateField("pickupLeadTimeMinutes", Number(event.target.value))} className={fieldClass} /></Field>
        <Field label="Pickup capacity per slot" error={formErrors.pickupCapacity}><input required aria-invalid={Boolean(formErrors.pickupCapacity)} min={1} max={200} type="number" value={form.pickupCapacity} onChange={(event) => updateField("pickupCapacity", Number(event.target.value))} className={fieldClass} /></Field>
        <Field label="Coordinates (optional)" error={formErrors.coordinates}><input aria-invalid={Boolean(formErrors.coordinates)} value={form.coordinates ?? ""} onChange={(event) => updateField("coordinates", event.target.value || null)} placeholder="Latitude, longitude" className={fieldClass} /></Field>
      </div>
      <fieldset className="mt-7"><legend className="text-base font-bold text-amber-950">Weekly opening hours</legend>{formErrors.hours && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{formErrors.hours}</p>}<div className="mt-3 grid gap-3 lg:grid-cols-2">{dayKeys.map((day) => { const hours = form.hours[day]; const closed = hours.open === null; return <div key={day} className="grid grid-cols-[7rem_1fr] items-center gap-3 rounded-2xl border border-[#ead9bf] p-3"><span className="text-sm font-semibold text-[#3b2116]">{dayLabels[day]}</span><div className="flex flex-wrap items-center gap-2"><label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={closed} onChange={(event) => updateHours(day, event.target.checked ? { open: null, close: null } : { open: "07:00", close: "19:00" })} /> Closed</label>{!closed && <><input aria-label={`${dayLabels[day]} opens`} type="time" value={hours.open} onChange={(event) => updateHours(day, { open: event.target.value, close: hours.close })} className={`${fieldClass} !min-h-10 !w-auto`} /><span className="text-slate-500">to</span><input aria-label={`${dayLabels[day]} closes`} type="time" value={hours.close} onChange={(event) => updateHours(day, { open: hours.open, close: event.target.value })} className={`${fieldClass} !min-h-10 !w-auto`} /></>}</div></div>; })}</div></fieldset>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">{error}</p>}
      <Button type="submit" disabled={busy} className="mt-6 min-h-11 rounded-full bg-amber-700 px-5 text-white hover:bg-amber-800">{busy ? "Saving…" : editingId ? "Save changes" : "Create store"}</Button>
    </form>

    <section className="rounded-3xl border border-[#ead9bf] bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-bold text-amber-950">Locations</h2><p className="mt-1 text-sm text-slate-600">Archiving removes a location from the public site and checkout without erasing its order history.</p></div><div className="flex flex-wrap gap-2"><input aria-label="Search stores" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stores" className={`${fieldClass} w-48`} /><select aria-label="Filter stores" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className={`${fieldClass} w-32`}><option value="active">Active</option><option value="archived">Archived</option><option value="all">All</option></select></div></div>
      <div className="mt-5 grid gap-4">{visibleStores.map((store) => <article key={store.id} className="rounded-2xl border border-[#ead9bf] p-4"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Store aria-hidden="true" className="size-5 text-amber-700" /><h3 className="font-bold text-amber-950">{store.name}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${store.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{store.isActive ? "Active" : "Archived"}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><MapPin aria-hidden="true" className="size-4" />{store.address}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Clock3 aria-hidden="true" className="size-4" />{store.pickupIntervalMinutes}-minute slots · {store.pickupLeadTimeMinutes}-minute lead time · capacity {store.pickupCapacity}</p></div><div className="flex gap-2"><Button type="button" variant="outline" className="min-h-11" disabled={busy} onClick={() => startEdit(store)}><Pencil aria-hidden="true" className="size-4" /> Edit</Button><Button type="button" variant={store.isActive ? "outline" : "default"} className={`min-h-11 ${store.isActive ? "border-red-200 text-red-800 hover:bg-red-50" : "bg-amber-700 text-white hover:bg-amber-800"}`} disabled={busy} onClick={() => changeStatus(store)}>{store.isActive ? <><Trash2 aria-hidden="true" className="size-4" /> Archive</> : <><RotateCcw aria-hidden="true" className="size-4" /> Restore</>}</Button></div></div></article>)}{!visibleStores.length && <p className="rounded-2xl border border-dashed border-[#dfc6a9] p-8 text-center text-slate-600">No stores match this view.</p>}</div>
    </section>
  </section>;
}

function Field({ label, children, className = "", error }: { label: string; children: React.ReactNode; className?: string; error?: string }) { return <label className={`grid gap-2 text-sm font-semibold text-[#3b2116] ${className}`}><span>{label}</span>{children}{error && <span role="alert" className="text-sm font-medium text-red-700">{error}</span>}</label>; }
