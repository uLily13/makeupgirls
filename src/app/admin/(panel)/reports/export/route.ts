import * as XLSX from "xlsx";
import { getStore } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const store = await getStore();

  // Sheet 1 — Orders
  const orders = store.orders.map((o) => {
    const u = store.users.find((x) => x.id === o.userId);
    return {
      "Захиалга": o.id,
      "Огноо": new Date(o.createdAt).toLocaleString("mn-MN"),
      "Хэрэглэгч": u?.name ?? "",
      "Утас": u?.phone ?? "",
      "Төлөв": o.status,
      "Барааны дүн": o.subtotal,
      "Хөнгөлөлт": o.discount,
      "Хүргэлт": o.shipping,
      "Нийт": o.total,
    };
  });

  // Sheet 2 — Products sold (from confirmed/delivered orders)
  const sold: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const o of store.orders) {
    if (o.status !== "Баталгаажсан" && o.status !== "Хүргэгдсэн") continue;
    for (const it of o.items) {
      if (it.free) continue;
      const s = (sold[it.slug] ??= { name: it.name, qty: 0, revenue: 0 });
      s.qty += it.qty;
      s.revenue += it.price * it.qty;
    }
  }
  const products = Object.values(sold)
    .sort((a, b) => b.qty - a.qty)
    .map((s) => ({ "Бүтээгдэхүүн": s.name, "Тоо ширхэг": s.qty, "Орлого": s.revenue }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orders), "Захиалга");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(products), "Борлуулалт");

  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="makeupgirls-report.xlsx"`,
    },
  });
}
