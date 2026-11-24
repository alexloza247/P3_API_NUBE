const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const ORIGENES = (process.env.ORIGEN_PERMITIDO || "")
    .split(",")
    .map(origen => origen.trim())
    .filter(Boolean);

app.use(cors({ origin: ORIGENES })); // solo estas páginas pueden usar la API
app.use(express.json()); // convierte el cuerpo de la petición a objeto JS

function requiereToken(req, res, next) {
    if (req.get("x-api-key") !== process.env.API_KEY) {
        return res.status(401).json({ error: "Token inválido o ausente" });
    }
    next(); // el token es correcto, continúa a la ruta
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Datos en memoria (en P3 se pueden pasar a una base de datos)
const archivo = "./productos.json";

function cargarProductos() {
    if (fs.existsSync(archivo)) {
        return JSON.parse(fs.readFileSync(archivo, "utf-8"));
    }
    return [
        { id: 1, nombre: "Teclado", precio: 350, stock: 10 },
        { id: 2, nombre: "Mouse", precio: 180, stock: 25 }
    ];
}

function guardarProductos() {
    fs.writeFileSync(archivo, JSON.stringify(productos, null, 2));
}

let productos = cargarProductos();
let siguienteId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;

app.get("/", (req, res) => {
    res.json({ mensaje: "API de productos funcionando" });
});


// GET
app.get("/api/productos", (req, res) => {
    const { buscar } = req.query;

    if (buscar) {
        const filtrados = productos.filter(p =>
            p.nombre.toLowerCase().includes(buscar.toLowerCase())
        );
        return res.status(200).json(filtrados);
    }
    res.status(200).json(productos);
});

app.get("/api/productos/:id", (req, res) => {
    const id = Number(req.params.id);
    const producto = productos.find(p => p.id === id);
    if (!producto) {
    return res.status(404).json({ error: `No existe el producto ${id}` });
    }
    res.status(200).json(producto);
});

// POST
function validar(datos) {
const errores = [];
if (!datos.nombre || typeof datos.nombre !== "string") errores.push("nombre es obligatorio");
if (typeof datos.precio !== "number" || datos.precio < 0) errores.push("precio debe ser un número positivo");
if (!Number.isInteger(datos.stock) || datos.stock < 0) errores.push("stock debe ser un entero positivo");
return errores;
}

app.post("/api/productos", requiereToken, (req, res) => {
    const errores = validar(req.body);
    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }
    const nuevo = { id: siguienteId++, ...req.body };
    productos.push(nuevo);
    guardarProductos();
    res.status(201).json(nuevo);
});

// PUT
app.put("/api/productos/:id", requiereToken, (req, res) => {
    const id = Number(req.params.id);
    const indice = productos.findIndex(p => p.id === id);
    if (indice === -1) return res.status(404).json({ error: `No existe el producto
    ${id}` });

    const errores = validar(req.body);
    if (errores.length > 0) return res.status(400).json({ errores });

    productos[indice] = { id, ...req.body };
    guardarProductos();
    res.status(200).json(productos[indice]);
});

// DELETE
app.delete("/api/productos/:id", requiereToken, (req, res) => {
    const id = Number(req.params.id);
    const existe = productos.some(p => p.id === id);
    if (!existe) return res.status(404).json({ error: `No existe el producto ${id}`
    });

    productos = productos.filter(p => p.id !== id);
    guardarProductos();
    res.status(204).send();
});

// Ruta no encontrada (siempre al final)
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));