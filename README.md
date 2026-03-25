# API Productos y Carritos — Entrega final

Servidor Node.js + Express. Persistencia en **MongoDB** (Mongoose), vistas con **Handlebars** y **Socket.io** en tiempo real.

## Instalación

```bash
npm install
```

## Configuración

1. Copia `.env.example` a `.env`.
2. Asigna `MONGODB_URI` con tu cadena de Atlas. Incluye el **nombre de la base de datos** en la URL, por ejemplo:  
   `...mongodb.net/mi_base?retryWrites=true&w=majority&appName=Cluster0`

### Cómo poner la URL de MongoDB paso a paso

1. En MongoDB Atlas, entra a **Database > Connect > Drivers** y copia el connection string.
2. En la raíz del proyecto crea/edita el archivo `.env`.
3. Pega la variable en una sola línea con este formato:

```env
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@cluster.mongodb.net/mi_base?retryWrites=true&w=majority&appName=Cluster0
```

4. Reemplaza:
   - `USUARIO` por tu usuario de Atlas.
   - `CONTRASENA` por tu contraseña.
   - `mi_base` por el nombre de tu base de datos (por ejemplo `entrega1_api`).
5. Guarda el archivo y ejecuta `npm start`.

Si en Atlas tienes restriccion de red, agrega tu IP en **Network Access** para permitir la conexion.

**Nota:** Si antes usabas carritos guardados con `product` como número, vacía o migra la colección `carts`: ahora cada ítem referencia al modelo `Product` por `ObjectId` (populate).

## Ejecución

```bash
npm start
```

Servidor: **http://localhost:8080**

## Vistas

| Ruta | Vista | Descripción |
|------|--------|-------------|
| GET `/` | — | Redirige a `/products` |
| GET `/products` | `index.handlebars` | Catálogo paginado, filtros y “Agregar al carrito” |
| GET `/products/:pid` | `productDetail.handlebars` | Detalle y botón agregar al carrito |
| GET `/carts/:cid` | `cartView.handlebars` | Carrito con productos completos (populate) |
| GET `/realtimeproducts` | `realTimeProducts.handlebars` | Lista en tiempo real (WebSockets) |

El **carrito** en el navegador usa `localStorage` (`cartId`) tras el primer POST a `/api/carts`.

## Productos — GET `/api/products` (paginación)

Query params opcionales:

| Param | Default | Descripción |
|-------|---------|-------------|
| `limit` | `10` | Cantidad por página (máx. 100) |
| `page` | `1` | Página |
| `sort` | — | `asc` / `desc` por **precio**; si no se envía, sin orden extra |
| `query` | — | Filtro / búsqueda (ver abajo) |

**`query`:**

- `category:Texto` — categoría (coincidencia parcial, sin regex del usuario en crudo peligroso: se escapan caracteres especiales).
- `availability:available` o `disponible` — `status: true` y `stock > 0`.
- `availability:unavailable` o `nodisponible` — resto.
- Cualquier otro texto — búsqueda en **título** y **descripción**.

**Respuesta:**

```json
{
  "status": "success",
  "payload": [ /* productos */ ],
  "totalPages": 3,
  "prevPage": null,
  "nextPage": 2,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "http://localhost:8080/api/products?limit=10&page=2"
}
```

En error, `status` es `"error"` y el resto de campos de paginación pueden ser `null` / `false`.

## Endpoints productos (`/api/products`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listado paginado (formato anterior) |
| GET | `/:pid` | Producto por id numérico |
| POST | `/` | Crear |
| PUT | `/:pid` | Actualizar |
| DELETE | `/:pid` | Eliminar |

## Endpoints carritos (`/api/carts`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear carrito |
| GET | `/:cid` | Carrito con `products.product` **populate** (documento completo) |
| POST | `/:cid/product/:pid` | Sumar cantidad (+1) o agregar línea |
| PUT | `/:cid` | Reemplazar líneas: `{ "products": [{ "product": <id>, "quantity": n }] }` |
| PUT | `/:cid/products/:pid` | Actualizar solo cantidad: `{ "quantity": n }` |
| DELETE | `/:cid/products/:pid` | Quitar producto del carrito |
| DELETE | `/:cid` | Vaciar el carrito (el documento sigue existiendo) |

## Persistencia

- **MongoDB** — modelos en `src/models/` (`Product`, `Cart` con `ref` a `Product`).

## Pruebas rápidas

Con el servidor en marcha: `./test-api.sh`
