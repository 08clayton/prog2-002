import { ToDo } from "./core";
import { Item } from "./core";

const filepath = "./lista.json";
const todo = new ToDo(filepath);
const port = 3000;

const AUTH_USER = "admin";
const AUTH_PASS = "senha123";

function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;

  const base64 = authHeader.slice("Basic ".length);
  const decoded = atob(base64);
  const [user, pass] = decoded.split(":");
  return user === AUTH_USER && pass === AUTH_PASS;
}

function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Unauthorized. Use HTTP Basic Auth." }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": 'Basic realm="ToDo API"',
      },
    }
  );
}

async function withLogging(
  request: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  const url = new URL(request.url);
  const start = Date.now();
  let response: Response;

  try {
    response = await handler();
  } catch (err) {
    response = new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const elapsed = Date.now() - start;
  console.log(
    `[${new Date().toISOString()}] ${request.method} ${url.pathname} → ${response.status} (${elapsed}ms)`
  );

  return response;
}

function validateDescription(body: any): string | null {
  if (!body || typeof body.description !== "string" || body.description.trim() === "") {
    return null;
  }
  return body.description.trim();
}

function parseIndexParam(searchParams: URLSearchParams): number | null {
  const raw = searchParams.get("index");
  if (raw === null || raw === "") return null;
  const index = parseInt(raw, 10);
  return isNaN(index) || index < 0 ? null : index;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}



async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  if (pathname === "/items" && method === "GET") {
    const allItems = await todo.getItems();
    const itemsData = allItems.map((item) => item.toJSON());

    const pageRaw = parseInt(searchParams.get("page") || "1", 10);
    const limitRaw = parseInt(searchParams.get("limit") || "10", 10);

    const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
    const limit = isNaN(limitRaw) || limitRaw < 1 ? 10 : Math.min(limitRaw, 100);

    const total = itemsData.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = itemsData.slice(start, start + limit);

    return json({
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }

  if (pathname === "/items/buscar" && method === "GET") {
    const descFilter = searchParams.get("description");

    if (!descFilter || descFilter.trim() === "") {
      return json({ error: "Query param 'description' is required" }, 400);
    }

    const allItems = await todo.getItems();
    const filtered = allItems
      .map((item) => item.toJSON())
      .filter((item) =>
        item.description.toLowerCase().includes(descFilter.toLowerCase().trim())
      );

    return json({ data: filtered, total: filtered.length });
  }

  if (pathname === "/items" && method === "POST") {
    if (!isAuthenticated(request)) return unauthorizedResponse();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const description = validateDescription(body);
    if (!description) {
      return json(
        { error: "Field 'description' is required and must be a non-empty string" },
        400
      );
    }

    const existing = await todo.findItemByDescription(description);
    if (existing) {
      return json(
        { error: `Item with description "${description}" already exists` },
        409
      );
    }

    if (body.status !== undefined && typeof body.status !== "boolean") {
      return json({ error: "Field 'status' must be a boolean" }, 400);
    }

    const item = new Item(description, body.status ?? false);
    await todo.addItem(item);

    return json({ message: "Item added successfully", item: item.toJSON() }, 201);
  }

//o senhor falou para não mexer porque tava dando um error 400, onde passava o index mas ele falava que era invalido mesmo com o index existindo
  if (pathname === "/items" && method === "PUT") {
    if (!isAuthenticated(request)) return unauthorizedResponse();

    const index = parseIndexParam(searchParams);
    if (index === null) {
      return json({ error: "Query param 'index' must be a non-negative integer" }, 400);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const description = validateDescription(body);
    if (!description) {
      return json(
        { error: "Field 'description' is required and must be a non-empty string" },
        400
      );
    }

    if (body.status !== undefined && typeof body.status !== "boolean") {
      return json({ error: "Field 'status' must be a boolean" }, 400);
    }

    let currentItem: Item | undefined;
    try {
      currentItem = await todo.findItemByIndex(index);
    } catch {
      return json({ error: "Index out of bounds" }, 404);
    }

    if (currentItem) {
      const current = currentItem.toJSON();
      const newStatus = body.status ?? current.status;
      if (current.description === description && current.status === newStatus) {
        return json(
          { error: "No changes detected. Item already has the same description and status." },
          409
        );
      }
    }

    try {
      const item = new Item(description, body.status ?? false);
      await todo.updateItem(index, item);
      return json({ message: "Item updated successfully", item: item.toJSON() });
    } catch (error: any) {
      return json({ error: error.message || "Failed to update item" }, 404);
    }
  }

  if (pathname === "/items" && method === "PATCH") {
    if (!isAuthenticated(request)) return unauthorizedResponse();

    const index = parseIndexParam(searchParams);
    if (index === null) {
      return json({ error: "Query param 'index' must be a non-negative integer" }, 400);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    if (body.status === undefined) {
      return json({ error: "Field 'status' is required for PATCH" }, 400);
    }

    if (typeof body.status !== "boolean") {
      return json({ error: "Field 'status' must be a boolean" }, 400);
    }

    let currentItem: Item | undefined;
    try {
      currentItem = await todo.findItemByIndex(index);
    } catch {
      return json({ error: "Index out of bounds" }, 404);
    }

    if (currentItem && currentItem.toJSON().status === body.status) {
      return json(
        { error: `Item already has status ${body.status}. No changes made.` },
        409
      );
    }

    try {
      await todo.ItemStatus(index, body.status);
      const updated = await todo.findItemByIndex(index);
      return json({ message: "Status updated successfully", item: updated?.toJSON() });
    } catch (error: any) {
      return json({ error: error.message || "Failed to update status" }, 404);
    }
  }

  if (pathname === "/items" && method === "DELETE") {
    if (!isAuthenticated(request)) return unauthorizedResponse();

    const index = parseIndexParam(searchParams);
    if (index === null) {
      return json({ error: "Query param 'index' must be a non-negative integer" }, 400);
    }

    try {
      await todo.removeItem(index);
      return json({ message: "Item removed successfully" });
    } catch (error: any) {
      return json({ error: error.message || "Failed to remove item" }, 404);
    }
  }

  return json({ error: "Not found" }, 404);
}

const server = Bun.serve({ 
  port,
  async fetch(request: Request) {
    return withLogging(request, () => handleRequest(request));
  },
});
console.log(`Servidor rodando em http://localhost:${port}`);
console.log(`Basic Auth → usuário: "${AUTH_USER}" | senha: "${AUTH_PASS}"`);