import { http } from "msw";
import { db, MockError } from "../database";
import { endpoint } from "./endpoint";
import { toWei } from "../../shared/domain/money";
export const catalogHandlers = [
  http.get(
    "/api/nfts",
    endpoint((request) => {
      const p = new URL(request.url).searchParams;
      let items =
        db.demo.scenario === "empty"
          ? []
          : db.nfts.filter(
              (n) =>
                (!p.get("q") ||
                  n.name.toLowerCase().includes(p.get("q")!.toLowerCase())) &&
                (!p.get("category") || n.category === p.get("category")) &&
                (!p.get("network") || n.network === p.get("network")) &&
                (!p.get("min") || toWei(n.price) >= toWei(p.get("min")!)) &&
                (!p.get("max") || toWei(n.price) <= toWei(p.get("max")!)) &&
                (p.get("tab") !== "trending" || n.featured),
            );
      items = [...items].sort((a, b) =>
        p.get("sort") === "price-asc"
          ? toWei(a.price) > toWei(b.price)
            ? 1
            : -1
          : p.get("sort") === "price-desc"
            ? toWei(a.price) < toWei(b.price)
              ? 1
              : -1
            : b.createdAt - a.createdAt,
      );
      const page = Math.max(1, Number(p.get("page")) || 1);
      return {
        items: items.slice((page - 1) * 9, page * 9),
        total: items.length,
        page,
        pageSize: 9,
      };
    }),
  ),
  http.get(
    "/api/nfts/:id",
    endpoint((_r, { id }) => {
      const nft = db.nfts.find((n) => n.id === id);
      if (!nft) throw new MockError("NFT não encontrado.", 404, "NOT_FOUND");
      return nft;
    }),
  ),
];
