const express = require('express');
const {Server: HttpServer} = require('http');
const {Server: IOServer} = require('socket.io');

const Contenedor = require('./controllers/contenedor.js');
const {knexMensajes, knexProductos} = require('./controllers/options.js')

const app = express();
const httpServer = new HttpServer(app);
const ioServer = new IOServer(httpServer);

const mensajes = new Contenedor(knexMensajes, 'messages');
const productos = new Contenedor(knexProductos, 'productos');

app.use("/api", express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ioServer.on("connection", async (socket) => {
    console.log("Nuevo usuario conectado");

    socket.emit("messages", await mensajes.getAll());

    socket.on("new-message", async (msj) => {
        await mensajes.save(msj);
        ioServer.sockets.emit("messages", await mensajes.getAll());
    });
    
    socket.emit("productos", await productos.getAll());

    socket.on("agregarProducto", async (producto) => {
        await productos.save(producto);
        ioServer.sockets.emit("productos", await productos.getAll());
    });
});

//MENSAJES
app.get("/api/mensajes", async (req, res) => {
    res.status(200).send(await mensajes.getAll());
});


app.get("/api/mensajes/:id?", async (req, res) => {
    const id = req.params.id;
    const mensajePorId = await mensajes.getById(id);
    mensajePorId !== null
        ? res.status(200).send(mensajePorId)
        : res.status(404).send(await mensajes.getAll());
});

app.delete("/api/mensajes/:id", async (req, res) => {
    const id = req.params.id;
    const mensajePorId = await mensajes.getById(id);
    mensajePorId !== null
        ? res.status(201).send(await mensajes.deleteById(id))
        : res.status(404).json(`ERROR ID:${id} no encontrado`);

    ioServer.sockets.emit("messages", await mensajes.getAll());
});

app.put("/api/mensajes/:id", async (req, res) => {
    const id = req.params.id;
    const exist = await mensajes.getById(id);
    if (exist !== null) {
        const { newMsj } = req.body;
        const msj_editado = await mensajes.updateById(id, `Msj ed.: ${newMsj}`);
        res.status(201).send(msj_editado);
        ioServer.sockets.emit("messages", await mensajes.getAll());
    } else res.status(404).json(`ERROR ID:${id} no encontrado`);
});

//PRODUCTOS
app.get("/api/productos" , async (req, res) => {
    res.status(200).send(await productos.getAll());
});

app.get("/api/productos/:id?", async (req, res) => {
    const id = req.params.id;
    const productoPorId = await productos.getById(id);
    productoPorId !== null
        ? res.status(200).send(productoPorId)
        : res.status(404).send(await productos.getAll());
});

app.delete("/api/productos/:id", async (req, res) => {
    const id = req.params.id;
    const productoPorId = await productos.getById(id);
    productoPorId !== null
        ? res.status(201).send(await productos.deleteById(id))
        : res.status(404).json(`ERROR ID:${id} no encontrado`);
});

app.put("/api/productos/:id", async (req, res) => {
    const id = req.params.id;
    const exist = await productos.getById(id);
    if (exist !== null) {
        const { nombre, precio, foto, stock } = req.body;
        const prod_editado = await productos.updateById(id, {
            nombre,
            precio,
            foto,
            stock,
        });
        res.status(201).send(prod_editado);
        ioServer.sockets.emit("productos", await productos.getAll());
    } else res.status(404).json(`ERROR ID:${id} no encontrado`);
});

app.use((req, res) => {
    res.status(404).json({
        error: -2,
        descripcion: `ruta ${req.originalUrl} y metodo ${req.method} no implementada`,
    });
})



const PORT = 8080;
httpServer.listen(PORT, (err) => {
    if(err) new Error (console.log(err));
    else console.log(`Servidor corriendo en el puerto ${PORT}`);
});