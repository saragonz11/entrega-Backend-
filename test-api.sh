#!/bin/bash
# Pruebas de la API - ejecutar con el servidor corriendo (npm start)

BASE="http://localhost:8080"

echo "=== 1. Crear producto ==="
curl -s -X POST "$BASE/api/products" \
  -H "Content-Type: application/json" \
  -d '{"title":"Laptop","price":999,"stock":5,"category":"Electrónica"}'
echo -e "\n"

echo "=== 2. Listar productos (paginado) ==="
curl -s "$BASE/api/products?limit=10&page=1"
echo -e "\n"

echo "=== 3. Crear carrito ==="
curl -s -X POST "$BASE/api/carts"
echo -e "\n"

echo "=== 4. Agregar producto 1 al carrito 1 ==="
curl -s -X POST "$BASE/api/carts/1/product/1"
echo -e "\n"

echo "=== 5. Ver carrito 1 (populate) ==="
curl -s "$BASE/api/carts/1"
echo -e "\n"

echo "=== Listo ==="
