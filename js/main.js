let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Funcion para crear paquete desde un JSON EXTERNO ( productos.json)
const productos = [];

// Creacion de las variables 
const contenedorProductos = document.querySelector("#productos");
const carritoVacio = document.querySelector("#carrito-vacio");
const carritoProductos = document.querySelector("#carrito-productos");
const carritoTotal = document.querySelector("#carrito-total");
const buttonContainer = document.querySelector("#button-container");

// Funcion de promesa para cargar producto de un JSON local 
async function cargarProductos() {
    try {
        const response = await fetch('./productos.json');
        const data = await response.json();
        data.forEach((producto) => {
            productos.push(producto);
            crearProductoDOM(producto);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Creacion de elementos del DOM para cada producto
function crearProductoDOM(producto) {
    let div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
        <img class="producto-img" src=${producto.img}>
        <h3>${producto.titulo}</h3>
        <p>${producto.descripcion}</p>
        <p>$${producto.precio}</p>
    `;

    let button = document.createElement("button");
    button.classList.add("producto-btn");
    button.innerText = "Agregar al carrito";
    button.addEventListener("click", () => {
        agregarAlCarrito(producto);
    });

    div.append(button);
    contenedorProductos.append(div);
}

// Actualizacion del carrito de compras y el total
function actualizarCarrito() {
    if (carrito.length === 0) {
        carritoVacio.classList.remove("d-none");
        carritoProductos.classList.add("d-none");
    } else {
        carritoVacio.classList.add("d-none");
        carritoProductos.classList.remove("d-none");

        carritoProductos.innerHTML = "";
        carrito.forEach((producto) => {
            let div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <h3>${producto.titulo}</h3>
                <p>$${producto.precio}</p>
                <p>Cant: ${producto.cantidad}</p>
                <p>Subt: $${producto.precio * producto.cantidad}</p>
            `;

            let buttonAumentar = document.createElement("button");
            buttonAumentar.classList.add("carrito-producto-btn");
            buttonAumentar.innerText = "➕";
            buttonAumentar.addEventListener("click", () => {
                aumentarCantidad(producto);
            });
            div.append(buttonAumentar);

            let buttonReducir = document.createElement("button");
            buttonReducir.classList.add("carrito-producto-btn");
            buttonReducir.innerText = "➖";
            buttonReducir.addEventListener("click", () => {
                reducirCantidad(producto);
            });
            div.append(buttonReducir);

            let button = document.createElement("button");
            button.classList.add("carrito-producto-btn");
            button.innerText = "✖️";
            button.addEventListener("click", () => {
                borrarDelCarrito(producto);
            });

            div.append(button);
            carritoProductos.append(div);
        });
    }
    actualizarTotal();
    localStorage.setItem("carrito", JSON.stringify(carrito));
}


// Funcion para agregar cosas al carrito


function agregarAlCarrito({ id, titulo, precio }) {
    Toastify({
        text: "Producto Agregado",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "rgb(80, 160, 187)",
        },
        offset: {
            x: "1.5rem", 
            y: "1.5rem" 
        },
        onClick: function () { }
    }).showToast();

    let itemEncontrado = carrito.find((item) => item.id === id);
    if (itemEncontrado) {
        itemEncontrado.cantidad++;
    } else {
        carrito.push({ id, titulo, precio, cantidad: 1 });
    }
    actualizarCarrito();
}

//Funcion para borrar elementos del carrito

function borrarDelCarrito(producto) {
    Toastify({
        text: "Producto Eliminado",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "#75a1ba",
        },
        offset: {
            x: "1.5rem", 
            y: "1.5rem" 
        },
        onClick: function () { }
    }).showToast();
    let indice = carrito.findIndex((item) => item.id === producto.id);
    carrito.splice(indice, 1);
    actualizarCarrito();
}

// Funcion para actualizar el total

function actualizarTotal() {
    let total = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
    carritoTotal.innerText = `$${total}`;
}

// Funcon para aumentar o restar cantidades 


function aumentarCantidad(producto) {
    let itemEncontrado = carrito.find((item) => item.id === producto.id);
    itemEncontrado.cantidad++;
    actualizarCarrito();
}

function reducirCantidad(producto) {
    let itemEncontrado = carrito.find((item) => item.id === producto.id);
    if (itemEncontrado.cantidad >= 2) {
        itemEncontrado.cantidad--;
        actualizarCarrito();
    } else {
        borrarDelCarrito(itemEncontrado);
    }
}

actualizarCarrito();
cargarProductos();

// Botón de  COMPRAR AHORA 
const buyButton = document.createElement('button');
buyButton.textContent = 'COMPRAR AHORA';
buyButton.classList.add('buy-now-btn');

buyButton.addEventListener('click', () => {
    let total = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
    if (carrito.length > 0 && total > 0) {
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Compra realizada!",
            showConfirmButton: false,
            timer: 2000
        });
    } else {
        Swal.fire({
            position: "center",
            icon: "warning",
            title: "Por favor, agregue productos al carrito.",
            showConfirmButton: false,
            timer: 2000
        });
    }
});

buttonContainer.appendChild(buyButton);

// Funcion para  Simulador de cuotas
function mostrarSimuladorCuotas() {
    let total = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

    if (total > 0) {
        Swal.fire({
            title: 'Simulador de Cuotas',
            html: `
                <input type="number" id="cuotas" placeholder="Número de cuotas" class="swal2-input">
                <p>Total: $${total}</p>
            `,
            confirmButtonText: 'Calcular',
            preConfirm: () => {
                const cuotas = document.getElementById('cuotas').value;
                if (cuotas > 0) {
                    const mensualidad = (total / cuotas).toFixed(2);
                    Swal.fire(`Cuota mensual: $${mensualidad}`);
                } else {
                    Swal.showValidationMessage('Ingresa un número válido de cuotas');
                }
            }
        });
    } else {
        Swal.fire('El carrito está vacío. Agrega productos para simular cuotas.');
    }
}

const simuladorButton = document.createElement('button');
simuladorButton.textContent = 'Simular Cuotas';
simuladorButton.classList.add('simulador-btn');
simuladorButton.addEventListener('click', mostrarSimuladorCuotas);
buttonContainer.appendChild(simuladorButton);



