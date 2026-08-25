import type { OrderStatus } from "@/app/generated/prisma/client";
import type { AdminOverviewMetrics } from "@/lib/orders/admin-metrics";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Coffee,
  Layers3,
  PackageCheck,
  ReceiptText,
  Store,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

type AdminOverviewProps = {
  metrics: AdminOverviewMetrics;
};

const currencyFormatter = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-ET", {
  maximumFractionDigits: 0,
});

const timestampFormatter = new Intl.DateTimeFormat("en-ET", {
  timeZone: "Africa/Addis_Ababa",
  dateStyle: "medium",
  timeStyle: "short",
});

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-[#d99831]",
  CONFIRMED: "bg-[#b56a32]",
  PREPARING: "bg-[#8f4c2c]",
  READY_FOR_PICKUP: "bg-[#4e763e]",
  COMPLETED: "bg-[#728851]",
  CANCELLED: "bg-[#aa6358]",
};

const statusBadgeStyles: Record<OrderStatus, string> = {
  PENDING: "border-[#f2d49b] bg-[#fff3d9] text-[#92560b]",
  CONFIRMED: "border-[#edc4a1] bg-[#fff0e4] text-[#8c471c]",
  PREPARING: "border-[#e2b49d] bg-[#fbeae0] text-[#773619]",
  READY_FOR_PICKUP: "border-[#c5dbb5] bg-[#edf6e7] text-[#41652f]",
  COMPLETED: "border-[#d4dfc5] bg-[#f2f7ec] text-[#567041]",
  CANCELLED: "border-[#e4c4be] bg-[#fbefed] text-[#8b4439]",
};

function formatMoney(value: number) {
  return currencyFormatter.format(value);
}

function formatCompactMoney(value: number) {
  return `ETB ${compactCurrencyFormatter.format(value)}`;
}

export default function AdminOverview({ metrics }: AdminOverviewProps) {
  const trendMaximum = Math.max(...metrics.trend.map((point) => point.value), 1);
  const statusMaximum = Math.max(
    ...metrics.statusBreakdown.map((item) => item.count),
    1,
  );
  const rangeLabel = `${metrics.trend[0]?.label ?? "Start"} – ${metrics.trend.at(-1)?.label ?? "today"}`;
  const trendSummary = metrics.trend
    .map((point) => `${point.label}: ${formatMoney(point.value)} across ${point.orderCount} ${point.orderCount === 1 ? "order" : "orders"}`)
    .join(". ");
  const HealthIcon = metrics.health.tone === "ready" ? CheckCircle2 : CircleAlert;

  return (
    <section className="mx-auto max-w-7xl space-y-6 pb-4 text-[#3b2116]">
      <header className="relative overflow-hidden rounded-[2rem] border border-[#6f442c] bg-gradient-to-br from-[#352017] via-[#542f1e] to-[#8b4d27] px-5 py-6 text-[#fff9ee] shadow-[0_24px_70px_rgba(78,42,22,.2)] sm:px-7 sm:py-8">
        <div aria-hidden="true" className="absolute -right-14 -top-16 size-56 rounded-full border border-[#f8d68d]/25 bg-[#f5bc4e]/10" />
        <div aria-hidden="true" className="absolute bottom-0 right-24 size-28 rounded-full bg-[#fff4df]/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f6c968]">Operations overview</p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">See the shift, not just the totals.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#f7dfbd] sm:text-base">A practical view of pickup demand, customer session activity, and menu readiness — based on the data currently in K-Coffee.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:items-center">
            <DashboardLink href="/dashboard/admin/orders" label="Review orders" />
            <DashboardLink href="/dashboard/cashier" label="Open pickup queue" accent />
          </div>
        </div>
        <p className="relative mt-6 text-xs text-[#eccd9e]">Updated {timestampFormatter.format(metrics.generatedAt)} Ethiopia time · Order value excludes cancellations and is not an accounting reconciliation.</p>
      </header>

      <section aria-labelledby="overview-metrics-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">At a glance</p>
            <h2 id="overview-metrics-heading" className="mt-1 text-xl font-extrabold tracking-tight text-[#2c1911]">Current service pulse</h2>
          </div>
          <p className="text-xs font-medium text-[#725b4c]">Reporting window: {rangeLabel}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={BarChart3}
            label="Order value"
            value={formatMoney(metrics.orderValue)}
            detail={`${metrics.orderCount} non-cancelled ${metrics.orderCount === 1 ? "order" : "orders"} created in the last ${metrics.reportingDayCount} days`}
            tone="gold"
          />
          <MetricCard
            icon={UsersRound}
            label="Active users"
            value={metrics.activeUserCount.toLocaleString("en-ET")}
            detail={`${metrics.activeCustomerCount} customer ${metrics.activeCustomerCount === 1 ? "account" : "accounts"} with a valid session updated in ${metrics.activeUserWindowDays} days`}
            tone="plum"
          />
          <MetricCard
            icon={Clock3}
            label="Pickup queue"
            value={metrics.activeQueueCount.toLocaleString("en-ET")}
            detail={metrics.readyForPickupCount > 0 ? `${metrics.readyForPickupCount} ready for collection` : "No orders waiting for collection"}
            tone="espresso"
          />
          <MetricCard
            icon={PackageCheck}
            label="Collected pickups"
            value={metrics.completedPaidOrderCount.toLocaleString("en-ET")}
            detail={`Paid and completed orders created in the last ${metrics.reportingDayCount} days`}
            tone="sage"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,.95fr)]">
        <section aria-labelledby="sales-activity-heading" className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-[0_16px_42px_rgba(82,45,24,.08)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">Sales activity</p>
              <h2 id="sales-activity-heading" className="mt-1 text-xl font-extrabold tracking-tight text-[#2c1911]">Order value by local day</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#725b4c]">{rangeLabel}. Canceled orders are excluded; payments are collected at pickup.</p>
            </div>
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#eed7b8] bg-[#fff8ee] px-3 text-xs font-bold text-[#7d4018]">
              <CalendarClock aria-hidden="true" className="size-4" />
              {metrics.reportingDayCount}-day view
            </span>
          </div>

          <figure className="mt-6" aria-labelledby="sales-activity-heading">
            <div role="img" aria-label={`Order value by Ethiopia-local day. ${trendSummary}`} className="grid grid-cols-7 items-end gap-1.5 sm:gap-3">
              {metrics.trend.map((point) => {
                const barHeight = point.value === 0 ? 0 : Math.max((point.value / trendMaximum) * 100, 7);

                return (
                  <div key={point.dateKey} className="flex min-w-0 flex-col items-center">
                    <p className="mb-2 h-4 max-w-full truncate text-center text-[10px] font-bold tabular-nums text-[#6e4027] sm:text-xs" title={formatMoney(point.value)}>{formatCompactMoney(point.value)}</p>
                    <div aria-hidden="true" className="flex h-40 w-full items-end rounded-xl bg-[linear-gradient(to_top,rgba(160,103,49,.1)_1px,transparent_1px)] bg-[length:100%_25%] px-1 sm:h-48 sm:px-2">
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-[#8a461f] via-[#b96f30] to-[#f1be4d] shadow-[0_8px_18px_rgba(128,65,23,.2)] transition-[height] duration-300 motion-reduce:transition-none" style={{ height: `${barHeight}%` }} />
                    </div>
                    <p className="mt-2 text-center text-[11px] font-bold text-[#725b4c] sm:text-xs">{point.shortLabel}</p>
                    <p className="mt-0.5 text-center text-[10px] text-[#9a745e]">{point.orderCount} {point.orderCount === 1 ? "order" : "orders"}</p>
                  </div>
                );
              })}
            </div>
            <figcaption className="mt-5 rounded-2xl border border-[#ead9bf] bg-[#fffaf3]/80 px-4 py-3 text-sm leading-6 text-[#725b4c]">{metrics.orderCount > 0 ? `The busiest day in this view is ${metrics.trend.reduce((busiest, point) => point.value > busiest.value ? point : busiest).label}.` : "There are no non-cancelled orders in this reporting window yet."}</figcaption>
            <details className="mt-3 rounded-2xl border border-[#ead9bf] bg-white/60 px-4 py-3 text-sm text-[#3b2116]">
              <summary className="cursor-pointer font-semibold text-[#7d4018] outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#b76c2e] focus-visible:ring-offset-2">View daily values as a table</summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-xs sm:text-sm">
                  <thead className="border-b border-[#ead9bf] text-[#725b4c]">
                    <tr><th className="pb-2 font-semibold">Day</th><th className="pb-2 text-right font-semibold">Orders</th><th className="pb-2 text-right font-semibold">Order value</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0dfc8]">
                    {metrics.trend.map((point) => <tr key={`table-${point.dateKey}`}><td className="py-2.5 font-medium">{point.label}</td><td className="py-2.5 text-right tabular-nums">{point.orderCount}</td><td className="py-2.5 text-right font-semibold tabular-nums">{formatMoney(point.value)}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </details>
          </figure>
        </section>

        <section aria-labelledby="readiness-heading" className="relative overflow-hidden rounded-[1.75rem] border border-[#ead9bf] bg-[#fffaf0]/85 p-5 shadow-[0_16px_42px_rgba(82,45,24,.08)] backdrop-blur-xl sm:p-6">
          <div aria-hidden="true" className="absolute -right-8 top-12 size-36 rounded-full bg-[#f4bd4d]/15 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">Overall status</p>
            <h2 id="readiness-heading" className="mt-1 text-xl font-extrabold tracking-tight text-[#2c1911]">Service readiness</h2>
            <div className={`mt-5 rounded-2xl border p-4 ${metrics.health.tone === "ready" ? "border-[#cbdcbf] bg-[#f2f8ec]" : metrics.health.tone === "blocked" ? "border-[#ecc4be] bg-[#fff1ee]" : "border-[#f2d49b] bg-[#fff6df]"}`}>
              <div className="flex items-start gap-3">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${metrics.health.tone === "ready" ? "bg-[#dbeacb] text-[#456934]" : metrics.health.tone === "blocked" ? "bg-[#f6d6d0] text-[#973e31]" : "bg-[#fde5ad] text-[#976017]"}`}><HealthIcon aria-hidden="true" className="size-5" /></span>
                <div>
                  <p className="font-extrabold text-[#3b2116]">{metrics.health.label}</p>
                  <p className="mt-1 text-sm leading-5 text-[#725b4c]">{metrics.health.detail}</p>
                </div>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <ReadinessStat icon={Store} label="Pickup stores" value={`${metrics.catalogue.activeStoreCount}/${metrics.catalogue.totalStoreCount}`} detail="active locations" />
              <ReadinessStat icon={Layers3} label="Menu categories" value={metrics.catalogue.activeCategoryCount.toLocaleString("en-ET")} detail="active categories" />
              <ReadinessStat icon={Coffee} label="Visible products" value={metrics.catalogue.visibleProductCount.toLocaleString("en-ET")} detail="available to customers" />
            </dl>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <DashboardLink href="/dashboard/admin/catalogue" label="Manage catalogue" muted />
              <DashboardLink href="/dashboard/admin/stores" label="Manage stores" muted />
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <section aria-labelledby="order-status-heading" className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-[0_16px_42px_rgba(82,45,24,.08)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">Order lifecycle</p>
              <h2 id="order-status-heading" className="mt-1 text-xl font-extrabold tracking-tight text-[#2c1911]">Where orders are now</h2>
              <p className="mt-2 text-sm leading-6 text-[#725b4c]">All order records grouped by their current workflow status.</p>
            </div>
            <Link href="/dashboard/admin/orders" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#8a461f] transition-colors hover:bg-[#fff1df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#934817]">Order operations <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          <ul className="mt-6 space-y-4">
            {metrics.statusBreakdown.map((item) => (
              <li key={item.status}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold text-[#3b2116]">{item.label}</span>
                  <span className="font-bold tabular-nums text-[#3b2116]">{item.count.toLocaleString("en-ET")}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#f1e3d3]" role="progressbar" aria-label={`${item.label} orders`} aria-valuemin={0} aria-valuemax={statusMaximum} aria-valuenow={item.count}>
                  <div className={`h-full rounded-full ${statusStyles[item.status]} transition-[width] duration-300 motion-reduce:transition-none`} style={{ width: `${(item.count / statusMaximum) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="recent-orders-heading" className="rounded-[1.75rem] border border-[#ead9bf] bg-[#fffaf0]/85 p-5 shadow-[0_16px_42px_rgba(82,45,24,.08)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">Latest activity</p>
              <h2 id="recent-orders-heading" className="mt-1 text-xl font-extrabold tracking-tight text-[#2c1911]">Recent orders</h2>
            </div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#f7e4c8] text-[#8a461f]"><Activity aria-hidden="true" className="size-5" /></span>
          </div>
          {metrics.recent.length > 0 ? (
            <ul className="mt-5 divide-y divide-[#ead9bf]">
              {metrics.recent.map((order) => (
                <li key={order.id}>
                  <Link href={`/dashboard/admin/orders?query=${encodeURIComponent(order.orderNumber)}`} className="group block rounded-xl py-3 outline-none transition-colors hover:bg-[#fff3e2] focus-visible:ring-2 focus-visible:ring-[#b76c2e] focus-visible:ring-offset-2">
                    <div className="flex items-start justify-between gap-3 px-1">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm font-bold text-[#7d4018]">{order.orderNumber}</p>
                        <p className="mt-1 truncate text-xs text-[#725b4c]">{order.store.name} · {timestampFormatter.format(order.createdAt)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold tabular-nums text-[#3b2116]">{formatMoney(order.totalAmount)}</p>
                        <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadgeStyles[order.status]}`}>{order.statusLabel}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#d9b993] bg-white/60 p-5 text-center">
              <ReceiptText aria-hidden="true" className="mx-auto size-6 text-[#b16c37]" />
              <p className="mt-3 font-bold text-[#3b2116]">No orders yet</p>
              <p className="mt-1 text-sm leading-6 text-[#725b4c]">New pickup orders will appear here as soon as customers place them.</p>
            </div>
          )}
          <Link href="/dashboard/admin/orders" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d7b693] bg-white/70 px-4 text-sm font-bold text-[#6e3b1e] transition-colors hover:bg-[#fff1df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#934817]">See all orders <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </section>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  detail: string;
  tone: "gold" | "plum" | "espresso" | "sage";
}) {
  const tones = {
    gold: "bg-[#fff5df] text-[#9a5a0e] ring-[#f6d495]",
    plum: "bg-[#f5e9e5] text-[#884e3f] ring-[#e3c4bb]",
    espresso: "bg-[#ede2d9] text-[#6b3a20] ring-[#d7b79f]",
    sage: "bg-[#edf3e8] text-[#53713d] ring-[#c9dbc0]",
  } as const;

  return (
    <article className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-[0_12px_30px_rgba(82,45,24,.07)] backdrop-blur-xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#725b4c]">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight tabular-nums text-[#2c1911]">{value}</p>
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ${tones[tone]}`}><Icon aria-hidden={true} className="size-5" /></span>
      </div>
      <p className="mt-3 min-h-10 text-xs leading-5 text-[#80614e]">{detail}</p>
    </article>
  );
}

function ReadinessStat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#ead9bf] bg-white/65 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f8e8cc] text-[#8a461f]"><Icon aria-hidden={true} className="size-4" /></span>
      <div className="min-w-0"><dt className="text-xs font-semibold text-[#725b4c]">{label}</dt><dd className="mt-0.5 font-extrabold tabular-nums text-[#3b2116]">{value}<span className="ml-1 text-xs font-medium text-[#80614e]">{detail}</span></dd></div>
    </div>
  );
}

function DashboardLink({
  href,
  label,
  accent = false,
  muted = false,
}: {
  href: string;
  label: string;
  accent?: boolean;
  muted?: boolean;
}) {
  const className = accent
    ? "bg-[#f5bd4d] text-[#452716] hover:bg-[#ffcc63]"
    : muted
      ? "border border-[#d7b693] bg-white/65 text-[#6e3b1e] hover:bg-[#fff1df]"
      : "border border-[#e9ca9e]/60 bg-white/10 text-[#fff9ee] hover:bg-white/20";

  return <Link href={href} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5bd4d] ${className}`}>{label}<ArrowRight aria-hidden="true" className="size-4" /></Link>;
}
