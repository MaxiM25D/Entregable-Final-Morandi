let productos = [];

// Recuperar productos guardados al inicio
function cargarDesdeLocalStorage() {
  const guardado = localStorage.getItem("productos");
  if (guardado) {
    productos = JSON.parse(guardado);
  }
  else {
    productos = [];
  }
  mostrarStock();
}
// Guardar productos cada vez que se actualiza el array
function guardarEnLocalStorage() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

const formAgregar = document.getElementById("form-agregar");
const formVenta = document.getElementById("form-venta");
const listaStock = document.getElementById("lista-stock");

// Mostrar stock//
function mostrarStock() {
  const btnLimpiar = document.getElementById("btn-limpiar");
  listaStock.innerHTML = ""; // Limpiar antes de volver a renderizar

  if (productos.length === 0) {
    listaStock.innerHTML = "<li class='no-stock'>😮 No hay productos cargados.</li>";
    btnLimpiar.style.display = "none"; // Ocultar botón si no hay productos
    return;
  }

  productos.forEach((p, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. Produc: ${p.nombre} - $${p.precio} | Stock: ${p.stock}`;
    listaStock.appendChild(li);
  });
btnLimpiar.style.display = "inline-block"; // Mostrar botón si hay productos
}

//Borrar lista de stock//
document.getElementById("btn-limpiar").addEventListener("click", () => {
  const confirmacion = Swal.mixin({
  customClass: {
    confirmButton: "swal-confirm",
    cancelButton: "swal-cancel"
  },
  buttonsStyling: false
});
confirmacion.fire({
  title: "Eliminando Productos",
  text: "⚠️ ¿Estás seguro de que querés borrar todos los productos?",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "SI, Eliminar",
  cancelButtonText: "NO, Cancelar",
  reverseButtons: true
}).then((result) => {
  if (result.isConfirmed) {
    localStorage.removeItem("productos");
    productos = [];
    mostrarStock();
    confirmacion.fire({
      title: "⚠️Eliminados!!",
      text: "✅Los Productos fueron eliminados correctamente",
      icon: "success",
     
    });
  } else if (
    result.dismiss === Swal.DismissReason.cancel
  ) {
    confirmacion.fire({
      title: "❌Cancelado",
      text: "⚠️Los productos no fueron borrados",
      icon: "error",
      
    });
  }
});

});

// Agregar producto
formAgregar.addEventListener("submit", function (e) {e.preventDefault();
  
  const nombreInput = document.getElementById("nombre").value.trim();
  const nombreLimpio = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(nombreInput);
  if (!nombreLimpio) {
  Swal.fire({
    icon: "error",
    title: "⚠️Nombre inválido",
    text: "🟢Solo se permiten letras y espacios.",
  });
  return;
  }
  const nombre = nombreInput;

  //validacion Input Precio//
  const precioInput = document.getElementById("precio").value.trim();
  const precioLimpio = precioInput.replace(/[.,]/g, "");
  const PrecioValido = /^\d+$/.test(precioLimpio);
  if (!PrecioValido || parseInt(precioLimpio) <= 0) {
  Swal.fire({
    icon: "error",
    title: "⚠️Precio inválido",
    text: "🟢Solo se permiten números enteros positivos (sin letras ni símbolos).",
  });
  return;
}
const precio = parseInt(precioLimpio);

  //validacion Input Stock/
  const stockInput = document.getElementById("stock").value.trim();
  const stockLimpio = /^\d+$/.test(stockInput)
  if (!stockLimpio || parseInt(stockInput) <= 0) {
  Swal.fire({
    icon: "error",
    title: "⚠️Stock inválido",
    text: "🟢Solo se permiten Numeros enteros, positivos, sin comas ni puntos.",
  });
  return;
  }
  const stock = parseInt(stockInput);

  // Agregar producto
  productos.push({ nombre, precio, stock });
  formAgregar.reset(); // Limpia el formulario
  mostrarStock(); // Actualiza la lista
  guardarEnLocalStorage();

  // Mostrar mensaje de éxito//
  let timerInterval;
    Swal.fire({
      title: "✅Producto agregado",
      html: `🟢Se agregó "${nombreInput}" con precio $${precio} y stock: ${stock}`,
      timer: 3000,
      icon: "success",
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup().querySelector("b");
        timerInterval = setInterval(() => {
          timer.textContent = `${Swal.getTimerLeft()}`;
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log("I was closed by the timer");
      }
    });
});

// Registrar venta
formVenta.addEventListener("submit", function (e) {e.preventDefault();

  const nombreVenta = document.getElementById("venta-nombre").value.trim().toLowerCase();
  const productoIndex = productos.findIndex(p => p.nombre.toLowerCase() === nombreVenta);

  if (productoIndex === -1) {
    Swal.fire({
      title: "❌Producto no encontrado",
      text: "🟢Corrobore que agregó este producto!",
      icon: "warning",
    });
    return;
  }
  const producto = productos[productoIndex];


  if (producto.stock > 0) {
    producto.stock--;

    // Si el stock llega a 0, eliminar el producto del array
    if (producto.stock === 0) {
      productos.splice(productoIndex, 1);

      Swal.fire({
        icon: "info",
        title: "✅ Venta registrada",
        html: `⚠️ Stock restante: ${producto.stock}<br>🚫 El producto "${producto.nombre}" fue eliminado automáticamente del stock.`,
      });
    } else {
      Swal.fire({
        title: "✅ Venta registrada",
        text: `Stock restante: ${producto.stock}`,
        icon: "success",
      });
    }

    guardarEnLocalStorage();
    mostrarStock();
  } else {
    Swal.fire({
      title: "❌ Sin Stock Disponible ❌",
      icon: "error",
    });
  }

  formVenta.reset();
});
//carga al iniciar la pagina//
cargarDesdeLocalStorage();

    //APIS USADAS//
// Función para obtener ciudad desde IP
async function obtenerCiudad() {
  try {
    const respuesta = await fetch("https://ipapi.co/json/");
    const data = await respuesta.json();
    return `${data.city}, ${data.country_name}`;
  } catch (error) {
    return "Ubicación desconocida";
  }
}

// Función para obtener clima desde OpenWeatherMap
async function obtenerClima(ciudad) {
  try {
    const key = "ab88fc9ddab9bba75cf91e69a50eff88"; //clave API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${key}&units=metric&lang=es`
    );
    const data = await response.json();
    return {
      temp: data.main.temp.toFixed(1),
      desc: data.weather[0].description
    };
  } catch (error) {
    console.error("Error obteniendo clima:", error);
    throw error;
  }
}

//Función para obtener fecha y hora desde WorldTimeAPI
async function obtenerFechaHora() {
  try {
    const response = await fetch("https://worldtimeapi.org/api/ip");
    const data = await response.json();
    const fecha = new Date(data.datetime);

    const fechaFormateada = fecha.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const horaFormateada = fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return { fecha: fechaFormateada, hora: horaFormateada };
  } catch (error) {
    console.error("Error obteniendo fecha/hora:", error);
    return {
      fecha: "Fecha desconocida",
      hora: "Hora desconocida"
    };
  }
}

//Mostrar todo al iniciar
(async function () {
  const ciudad = await obtenerCiudad();
  const ciudadNombre = ciudad.split(",")[0];
  const { fecha, hora } = await obtenerFechaHora();

  try {
    const clima = await obtenerClima(ciudadNombre);
    Toastify({
      text: `📍 ${ciudad}\n📅 ${fecha} - 🕒 ${hora}\n🌡 ${clima.temp}°C, ${clima.desc}`,
      duration: 8000,
      gravity: "top",
      position: "right",
      style: {
        background: "#2A3663",
        borderRadius: "10px",
        color: "#fff",
        whiteSpace: "pre-line"
      }
    }).showToast();
  } catch {
    Toastify({
      text: `📍 ${ciudad}\n📅 ${fecha} - 🕒 ${hora}\n⚠️ Clima no disponible`,
      duration: 7000,
      gravity: "top",
      position: "right",
      style: {
        background: "#A0153E",
        borderRadius: "10px",
        color: "#fff",
        whiteSpace: "pre-line"
      }
    }).showToast();
  }
})();