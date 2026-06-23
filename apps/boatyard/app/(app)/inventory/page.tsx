import { createAdminClient, DEMO_TENANT } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = createAdminClient();

  const { data: parts, error } = await supabase
    .from("parts")
    .select("*")
    .eq("tenant_id", DEMO_TENANT)
    .order("bin_location");

  if (error) {
    return <div className="p-8 text-red-600">Error: {error.message}</div>;
  }

  const totalValue = (parts ?? []).reduce(
    (sum, p) => sum + (p.quantity ?? 0) * Number(p.unit_cost ?? 0),
    0
  );
  const belowReorder = (parts ?? []).filter(
    (p) => (p.quantity ?? 0) <= (p.reorder_point ?? 0)
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Parts Inventory</h1>
          <p className="text-sm text-slate-500">
            {parts?.length ?? 0} SKUs &middot; stock value €{totalValue.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
            {belowReorder > 0 && (
              <span className="ml-3 text-amber-600 font-medium">
                ⚠ {belowReorder} below reorder point
              </span>
            )}
          </p>
        </div>
        <button
          className="bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors opacity-50 cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          + Add Part
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Bin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">In Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reorder At</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Cost</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock Value</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(parts ?? []).map((part) => {
                const low = (part.quantity ?? 0) <= (part.reorder_point ?? 0);
                const rowValue = (part.quantity ?? 0) * Number(part.unit_cost ?? 0);
                return (
                  <tr
                    key={part.id}
                    className={low ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{part.bin_location ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{part.sku}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{part.name}</td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${low ? "text-amber-700" : "text-slate-800"}`}>
                      {part.quantity ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 tabular-nums">{part.reorder_point ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                      €{Number(part.unit_cost ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800 tabular-nums">
                      €{rowValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {low ? (
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                <td colSpan={6} className="px-4 py-3 text-slate-600 text-sm">Total stock value</td>
                <td className="px-4 py-3 text-right text-slate-900 tabular-nums">
                  €{totalValue.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
