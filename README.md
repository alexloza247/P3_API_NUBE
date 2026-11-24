# API REST de productos (Practica 2)

**Integrantes:** 
- Sergio Jaciel Jimenez Gonzalez
- Alejandro Lozano Avila

---

## Descripcion
Servicio web REST desarrollado con Node.js que administra un catalogo de productos mediante operaciones CRUD

---

## Requisitos e instalacion
* Node.js v18 o superior

1. Clonar el repositorio y entrar a la carpeta del proyecto:
   ```bash
   git clone <URL-DE-TU-REPOSITORIO>
   cd p2-api-productos
   ```

2. Instalar las dependencias ('express', 'cors', etc.):
   ```bash
   npm install
   ```

3. Iniciar el servidor:
   ```bash
   npm start
   ```
   (Para desarrollo con reinicio automático al guardar cambios, usar `npm run dev`).

El servidor quedará disponible en `http://localhost:3000`.

---

## Endpoints de la API

| Método | Ruta | Acción | Respuesta correcta | Posibles errores |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/productos` | Listar todos | `200` + arreglo | — |
| `GET` | `/api/productos/:id` | Ver uno | `200` + objeto | `404` |
| `POST` | `/api/productos` | Crear | `201` + objeto creado | `400` |
| `PUT` | `/api/productos/:id` | Actualizar | `200` + objeto actualizado | `400`, `404` |
| `DELETE` | `/api/productos/:id` | Eliminar | `204` sin contenido | `404` |

---

### Funcionalidades adicionales implementadas
* **Documentación interactiva (Swagger UI):** Disponible en `http://localhost:3000/api-docs`.
* **Búsqueda por nombre:** `GET /api/productos?buscar=tec` filtra los productos que coincidan con el texto indicado.

---

## Ejemplo de uso

### Petición (`POST /api/productos`)
Enviar el cuerpo en formato JSON (`Content-Type: application/json`):

```json
{
  "nombre": "Monitor",
  "precio": 2500,
  "stock": 5
}
```

### Respuesta (`201 Created`)

```json
{
  "id": 3,
  "nombre": "Monitor",
  "precio": 2500,
  "stock": 5
}
```
