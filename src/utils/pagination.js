/**
 * URL de la misma ruta de listado conservando limit, sort y query.
 * @param {import("express").Request} req
 * @param {number} page
 */
function buildProductsListUrl(req, page) {
  const host = req.get("host");
  const protocol = req.protocol;
  const path = req.baseUrl + req.path;
  const params = new URLSearchParams();
  const limit = req.query.limit ?? "10";
  params.set("limit", String(limit));
  params.set("page", String(page));
  if (req.query.sort) params.set("sort", String(req.query.sort));
  if (req.query.query) params.set("query", String(req.query.query));
  return `${protocol}://${host}${path}?${params.toString()}`;
}

/**
 * Cuerpo JSON estándar para GET /api/products (entrega final).
 * @param {import("express").Request} req
 * @param {{ payload: unknown, totalPages: number, page: number }} opts
 */
function productsPaginatedPayload(req, opts) {
  const { payload, totalPages, page } = opts;
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const prevPage = hasPrevPage ? page - 1 : null;
  const nextPage = hasNextPage ? page + 1 : null;
  const prevLink = hasPrevPage ? buildProductsListUrl(req, prevPage) : null;
  const nextLink = hasNextPage ? buildProductsListUrl(req, nextPage) : null;

  return {
    status: "success",
    payload,
    totalPages,
    prevPage,
    nextPage,
    page,
    hasPrevPage,
    hasNextPage,
    prevLink,
    nextLink,
  };
}

module.exports = { buildProductsListUrl, productsPaginatedPayload };
