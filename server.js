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

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Conectado a MongoDB Atlas"))
    .catch(err => console.error("Error de MongoDB:", err));

const Producto = mongoose.model("Producto", new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true}
}, {
    toJSON: { virtuals: true }
}));

function requiereToken(req, res, next) {
    if (req.get("x-api-key") !== process.env.API_KEY) {
        return res.status(401).json({ error: "Token inválido o ausente" });
    }
    next(); // el token es correcto, continúa a la ruta
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
app.get("/api/productos", async (req, res) => {
    const { buscar } = req.query;

    if (buscar) {
        const filtrados = await Producto.find({
            nombre: { $regex: buscar, $options: "i" }
        });
        return res.status(200).json(filtrados);
    }
    const lista = await Producto.find();
    res.status(200).json(lista);
});

app.get("/api/productos/:id", async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: `No existe el producto ${req.params.id}` });
        }
        res.status(200).json(producto);
    } catch {
        res.status(404).json({ error: `No existe el producto ${req.params.id}` })
    }
});

// POST
function validar(datos) {
const errores = [];
if (!datos.nombre || typeof datos.nombre !== "string") errores.push("nombre es obligatorio");
if (typeof datos.precio !== "number" || datos.precio < 0) errores.push("precio debe ser un número positivo");
if (!Number.isInteger(datos.stock) || datos.stock < 0) errores.push("stock debe ser un entero positivo");
return errores;
}

app.post("/api/productos", requiereToken, async (req, res) => {
    const errores = validar(req.body);
    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }
    const nuevo = await Producto.create(req.body);
    res.status(201).json(nuevo);
});

// PUT
app.put("/api/productos/:id", requiereToken, async (req, res) => {
    const errores = validar(req.body);
    if (errores.length > 0) return res.status(400).json({ errores });

    try{
        const actualizado = await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!actualizado) return res.status(404).json({ error: `No existe el producto ${req.params.id}` });
        res.status(200).json({ error: `No existe el producto ${req.params.id}` });
    } catch {
        res.status(404).json({ error: `No existe el producto ${req.params.id}` });
    }
});

// DELETE
app.delete("/api/productos/:id", requiereToken, async (req, res) => {
    try {
        const eliminado = await Producto.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ error: `No existe el producto ${req.params.id}` });
        res.status(204).send();
    } catch {
        res.status(404).json({ error: `No existe el producto ${req.params.id}` });
    }
});

app.get("/api/salud", (req, res) => {
    res.json({ estado: "ok" });
});

// Ruta no encontrada (siempre al final)
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
