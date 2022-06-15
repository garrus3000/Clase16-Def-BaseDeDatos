const socket = io();

const chat = document.getElementById("enviarMensaje");

chat.addEventListener("submit", (e) => {
    e.preventDefault();
    const mensaje = {
        author: e.target.author.value,
        fecha: new Date().toLocaleString(),
        newMsj: e.target.newMsj.value,
        codigo: Date.now()	
    };

    socket.emit("new-message", mensaje);
    e.target.newMsj.value = "";
});

const formatoMensajes = (mensaje) => {
    const { author, fecha, newMsj } = mensaje;
    return `
    <div> <span class="fw-bold text-primary">${author}</span> <span class="text-brown">${fecha}</span>: <span class="fst-italic text-success">${newMsj}</span> </div>
    `;
};

const renderMensajes = (mensajes) => {
    const listaDeMensajes = mensajes
        .map((mensaje) => formatoMensajes(mensaje))
        .join("");
    if (listaDeMensajes === "") {
        document.getElementById("messages").innerHTML = `<div> <p class=" p-2 text-danger fs-3 text-center">No hay mensajes</p> </p>`;
    } else {
        document.getElementById("messages").innerHTML = listaDeMensajes;
    }
};

const listaDeProductos = async (productos) => {
    const fetchProd = fetch("./views/productos.hbs")
        .then((res) => res.text())
        .then((view) => {
            const template = Handlebars.compile(view);
            const html = template({ productos });
            return html;
        })
        .then((html) => html);
    return fetchProd;
};

socket.on("productos", (productos) => {
    listaDeProductos(productos).then((html) => {
        document.getElementById("productos").innerHTML = html;
    });
});

const ingresoProducto = document.getElementById("ingresarProducto");

ingresoProducto.addEventListener("submit", (e) => {
    e.preventDefault();
    const producto = {
        timestamp: new Date().toISOString(),
        nombre: e.target.nombre.value,
        descripcion : e.target.nombre.value,
        precio : e.target.precio.value,
        foto : e.target.foto.value,
        codigo: Date.now(),
        stock : 200   
    };

    socket.emit("agregarProducto", producto);
    e.target.nombre.value = "";
    e.target.precio.value = "";
    e.target.foto.value = "";
});


socket.on("messages", (msj) => renderMensajes(msj));