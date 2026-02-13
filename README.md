# Entrega N° 1 - API Productos y Carritos

Servidor Node.js + Express para gestionar productos y carritos de compra. Persistencia en archivos JSON.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

El servidor escucha en **http://localhost:8080**.

## Endpoints

### Productos (`/api/products`)

| Método | Ruta  | Descripción                |
| ------ | ----- | -------------------------- |
| GET    | /     | Listar todos los productos |
| GET    | /:pid | Obtener producto por ID    |
| POST   | /     | Crear producto             |
| PUT    | /:pid | Actualizar producto        |
| DELETE | /:pid | Eliminar producto          |

**POST /** – Body (ejemplo):

```json
{
  "title": "Producto ejemplo",
  "description": "Descripción",
  "code": "ABC123",
  "price": 100,
  "status": true,
  "stock": 10,
  "category": "Categoría",
  "thumbnails": ["/img1.jpg", "/img2.jpg"]
}
```

El `id` se autogenera.

### Carritos (`/api/carts`)

| Método | Ruta               | Descripción                    |
| ------ | ------------------ | ------------------------------ |
| POST   | /                  | Crear carrito                  |
| GET    | /:cid              | Listar productos del carrito   |
| POST   | /:cid/product/:pid | Agregar producto (quantity +1) |

Al agregar un producto ya existente en el carrito, se incrementa su `quantity`.

## Persistencia

- **products.json** – Productos (en `src/data/`)
- **carts.json** – Carritos (en `src/data/`)

Se pueden probar los endpoints con Postman o cualquier cliente HTTP.
