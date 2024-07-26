window.addEventListener('load', () => {
  // Mostrar el splash screen al cargar la página
  const splashScreen = document.getElementById('splash-screen');
  splashScreen.style.display = 'flex';
  hideSplashScreen();
});

// Función para ocultar el splash screen después de 5 segundos
function hideSplashScreen() {
  const splashScreen = document.getElementById('splash-screen');
  setTimeout(() => {
    splashScreen.classList.add('hidden') // Aplicar transición para desvanecer el splash screen

  setTimeout(() => {
    splashScreen.style.display = 'none'; // Ocultar el splash screen después de la transición
  }, 1000); // Tiempo coincidente con la transición en CSS
}, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de variables desde localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const sales = JSON.parse(localStorage.getItem('sales')) || [];
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  // Variables de referencia a elementos del DOM
  const cartIcon = document.getElementById('cart-icon');
  const cartCount = document.getElementById('cart-count');
  const modal = document.getElementById('cart-modal');
  const closeModal = document.querySelector('.close');
  const cartEmptyMessage = document.getElementById('cart-empty-message');
  const emptyCartButton = document.getElementById('empty-cart');
  const checkoutButton = document.getElementById('checkout');

  // Función para actualizar el carrito
  function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceContainer = document.getElementById('total-price');
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    // Mostrar mensaje de carrito vacío si no hay items
    if (cart.length === 0) {
      cartEmptyMessage.style.display = 'block';
      emptyCartButton.disabled = true;
      checkoutButton.disabled = true;
    } else {
      cartEmptyMessage.style.display = 'none';
      emptyCartButton.disabled = false;
      checkoutButton.disabled = false;
    }

    // Renderizar los items del carrito
    cart.forEach((item, index) => {
      const li = document.createElement('li');

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;

      const detailsDiv = document.createElement('div');
      detailsDiv.classList.add('cart-item-details');
      detailsDiv.innerHTML = `<strong>${item.name}</strong><br>$${item.price.toFixed(2)}`;

      const quantityDiv = document.createElement('div');
      quantityDiv.classList.add('cart-item-quantity');
      quantityDiv.innerHTML = `
        <button class="decrease-quantity" data-index="${index}">-</button>
        <input type="number" value="${item.quantity}" min="1" readonly>
        <button class="increase-quantity" data-index="${index}">+</button>
      `;

      const removeButton = document.createElement('button');
      removeButton.classList.add('remove-item');
      removeButton.setAttribute('data-index', index);
      removeButton.innerHTML = '&times;';

      li.appendChild(img);
      li.appendChild(detailsDiv);
      li.appendChild(quantityDiv);
      li.appendChild(removeButton);
      cartItemsContainer.appendChild(li);

      totalPrice += item.price * item.quantity;
    });

    totalPriceContainer.textContent = totalPrice.toFixed(2);
    cartCount.textContent = cart.length;
  }

  // Función para mostrar los productos principales
  function displayMainProducts() {
    const productsSection = document.getElementById('products');
    productsSection.innerHTML = '';

    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    // Retrasar la verificación del inventario y la posible muestra de la alerta
    setTimeout(() => {
      if (inventory.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No hay productos disponibles',
          text: 'No hay productos disponibles en el inventario.',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        inventory.forEach(product => {
          const productDiv = document.createElement('div');
          productDiv.classList.add('product');
          productDiv.setAttribute('data-id', product.id);
          productDiv.setAttribute('data-name', product.name);
          productDiv.setAttribute('data-price', product.price);
          productDiv.setAttribute('data-image', product.image);

          productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button class="add-to-cart"><i class="fas fa-cart-plus"></i> Agregar</button>
            </div>
          `;

          // Verificar si el producto está agotado
          if (product.stock <= 0) {
            productDiv.classList.add('out-of-stock');
            productDiv.querySelector('.add-to-cart').disabled = true;
          }

          productsSection.appendChild(productDiv);
        });

        // Agregar event listeners a los botones de agregar al carrito
        document.querySelectorAll('.add-to-cart').forEach(button => {
          button.addEventListener('click', () => {
            const spinner = button.querySelector('.spinner');
            const icon = button.querySelector('.fas');

            spinner.style.display = 'inline-block';
            icon.style.display = 'none';
            button.disabled = true;

            const addItemToCart = () => {
              const product = button.parentElement;
              const productId = product.getAttribute('data-id');
              const productName = product.getAttribute('data-name');
              const productPrice = parseFloat(product.getAttribute('data-price'));
              const productImage = product.getAttribute('data-image');

              const inventoryItem = inventory.find(item => item.id === productId);

              if (inventoryItem && inventoryItem.stock > 0) {
                const existingItem = cart.find(item => item.id === productId);
                if (existingItem) {
                  if (inventoryItem.stock > existingItem.quantity) {
                    existingItem.quantity++;
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Stock insuficiente',
                      text: 'No hay suficiente stock disponible para este producto.'
                    });
                  }
                } else {
                  cart.push({ id: productId, name: productName, price: productPrice, quantity: 1, image: productImage });
                }

                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();

                if (inventoryItem.stock <= cart.find(item => item.id === productId).quantity) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Producto agotado',
                    text: 'Este producto se ha agotado.'
                  });
                }
              } else if (!inventoryItem) {
                Swal.fire({
                  icon: 'error',
                  title: 'Producto no disponible',
                  text: 'El producto no está disponible en el inventario.'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Stock insuficiente',
                  text: 'No hay suficiente stock disponible para este producto.'
                });
              }

              spinner.style.display = 'none';
              icon.style.display = 'inline-block';
              button.disabled = false;
            };

            const checkConnectionAndAddToCart = () => {
              if (navigator.onLine) {
                addItemToCart();
              } else {
                const timeout = setTimeout(() => {
                  alert('Sin conexión a internet');
                  spinner.style.display = 'none';
                  icon.style.display = 'inline-block';
                  button.disabled = false;
                }, 5000);

                const handleOnline = () => {
                  clearTimeout(timeout);
                  addItemToCart();
                  window.removeEventListener('online', handleOnline);
                };

                window.addEventListener('online', handleOnline);
              }
            };

            checkConnectionAndAddToCart();
          });
        });
      }
    }, 4000); // Espera el mismo tiempo que el splash screen para mostrar la alerta
  }

  // Mostrar el modal del carrito al hacer clic en el icono del carrito
  cartIcon.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Cerrar el modal al hacer clic en el botón de cerrar
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Cerrar el modal al hacer clic fuera de él
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Manejar los eventos en los items del carrito (incrementar, decrementar cantidad y eliminar)
  document.getElementById('cart-items').addEventListener('click', (event) => {
    if (event.target.classList.contains('increase-quantity')) {
      const index = event.target.getAttribute('data-index');
      const item = cart[index];
      const inventoryItem = inventory.find(product => product.id === item.id);

      if (inventoryItem && inventoryItem.stock > item.quantity) {
        cart[index].quantity++;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Stock insuficiente',
          text: 'Producto insuficiente en el inventario.'
        });
      }
    } else if (event.target.classList.contains('decrease-quantity')) {
      const index = event.target.getAttribute('data-index');
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
      }
    } else if (event.target.classList.contains('remove-item')) {
      const index = event.target.getAttribute('data-index');
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
    }
  });

  // Vaciar el carrito con confirmación
  emptyCartButton.addEventListener('click', () => {
    Swal.fire({
      title: '¿Vaciar carrito?',
      text: '¿Está seguro de que desea vaciar el carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        cart.length = 0;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
      }
    });
  });

  // Función para vender un producto y actualizar el inventario
  const sellProduct = (productId, quantitySold) => {
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const productIndex = inventory.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
      inventory[productIndex].stock -= quantitySold; // Reducir el stock vendido
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  };

  // Realizar el checkout con confirmación
  checkoutButton.addEventListener('click', () => {
    $('body').waitMe({
      effect: 'bounce',
      bg: 'rgba(255,255,255,0.7)',
      color: '#000'
    });

    const sale = {
      date: new Date().toISOString(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    sales.push(sale);
    localStorage.setItem('sales', JSON.stringify(sales));

    // Vender cada producto del carrito y actualizar el inventario
    sale.items.forEach(item => {
      sellProduct(item.id, item.quantity);
    });

    localStorage.removeItem('cart');
    cart.length = 0;
    updateCart();
    modal.style.display = 'none';

    // Simular un retraso para mostrar el efecto de "procesando"
    setTimeout(() => {
      $('body').waitMe('hide');
      Swal.fire({
      title: 'Compra guardada',
      text: 'Su compra se ha guardado con éxito.',
      icon: 'success',
      confirmButtonText: 'OK',
      allowOutsideClick: true // Permitir clics fuera del modal
    }).then((result) => {
      if (result.isConfirmed) {
        checkStockAndUpdateUI();
      }
    });
  
  // Añadir event listener al documento para cualquier clic
  document.addEventListener('click', function handler(event) {
    if (!event.target.closest('.swal2-popup')) {
      checkStockAndUpdateUI();
      document.removeEventListener('click', handler); // Remover el event listener después de ejecutarse una vez
    }
  });
}, 3000);
});

// Función para verificar el stock y actualizar la interfaz
function checkStockAndUpdateUI() {
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  inventory.forEach(product => {
    const productDiv = document.querySelector(`[data-id="${product.id}"]`);
    if (productDiv) {
      // Verificar si el producto está agotado
      if (product.stock <= 0) {
        productDiv.classList.add('out-of-stock');
        productDiv.querySelector('.add-to-cart').disabled = true;
      }
    }
  });
}

  // Actualizar el carrito y mostrar los productos principales al cargar la página
  updateCart();
  displayMainProducts();

});












document.getElementById('generar-reporte').addEventListener('click', () => {
  // Obtener los valores de las fechas de inicio y fin
  const fechaInicio = document.getElementById('fecha-inicio').value;
  const fechaFin = document.getElementById('fecha-fin').value;

  // Crear objetos de fecha a partir de los valores ingresados
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);

  // Validar que ambas fechas hayan sido seleccionadas
  if (!fechaInicio || !fechaFin) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, seleccione ambas fechas.',
    });
    return;
  }

  // Validar que la fecha de inicio no sea posterior a la fecha de fin
  if (fechaInicioObj > fechaFinObj) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La fecha de inicio no puede ser posterior a la fecha fin.',
    });
    return;
  }

  // Generar el reporte con las fechas válidas
  generarReporte(fechaInicio, fechaFin);
});

const rowsPerPage = 10; // Número de filas por página
let currentPage = 1; // Página actual para la paginación
let currentRows = []; // Filas actuales para el reporte

function generarReporte(fechaInicio, fechaFin) {
  // Obtener las ventas del localStorage
  const sales = JSON.parse(localStorage.getItem('sales')) || [];
  
  // Filtrar las ventas dentro del rango de fechas seleccionado
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    saleDate.setHours(0, 0, 0, 0);
    fin.setDate(fin.getDate() + 1);

    return saleDate >= inicio && saleDate <= fin;
  });

  // Mostrar mensaje si no se encuentran ventas en el rango de fechas
  if (filteredSales.length === 0) {
    document.querySelector('#reporte-tabla tbody').innerHTML = '<tr><td colspan="5">No se encontraron resultados.</td></tr>';
    document.getElementById('total-ventas').innerHTML = '';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  let totalVentas = 0;
  const rows = [];

  // Crear las filas de la tabla con las ventas filtradas
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const total = item.price * item.quantity;
      totalVentas += total;
      rows.push(`
        <tr>
          <td>${new Date(sale.date).toLocaleDateString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${total.toFixed(2)}</td>
        </tr>
      `);
    });
  });

  currentRows = rows; // Guardar las filas actuales
  currentPage = 1; // Resetear a la primera página al generar un nuevo reporte
  renderTable(); // Renderizar la tabla
  renderPagination(); // Renderizar la paginación

  // Mostrar el total de ventas
  const totalVentasDiv = document.getElementById('total-ventas');
  totalVentasDiv.innerHTML = `<strong>Total Ventas: $${totalVentas.toFixed(2)}</strong>`;

  // Generar el PDF del reporte
  generarPDF(fechaInicio, fechaFin, totalVentas);
}

function renderTable() {
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = currentRows.slice(startIndex, endIndex).join('');

  document.querySelector('#reporte-tabla tbody').innerHTML = paginatedRows;
}

function renderPagination() {
  const totalPages = Math.ceil(currentRows.length / rowsPerPage);
  const paginationContainer = document.getElementById('pagination');

  let paginationHTML = '';

  // Botón de página anterior
  if (currentPage > 1) {
    paginationHTML += `<button onclick="changePage(${currentPage - 1})">&laquo; Anterior</button>`;
  }

  // Botones de número de página
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
  }

  // Botón de página siguiente
  if (currentPage < totalPages) {
    paginationHTML += `<button onclick="changePage(${currentPage + 1})">Siguiente &raquo;</button>`;
  }

  paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
  currentPage = page;
  renderTable();
  renderPagination();
}

function generarPDF(fechaInicio, fechaFin, totalVentas) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 297]
  });

  // Información del negocio
  const negocioInfo = {
    logo: 'https://imgs.search.brave.com/eO_0__Da2vAhm2z5FZ8Uy2cTB6h_MjJFyhVM5RzsVoU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudmV4ZWxzLmNv/bS9tZWRpYS91c2Vy/cy8zLzEyOTk1NC9p/c29sYXRlZC9wcmV2/aWV3L2FiYTAyMDcy/NmZjYTY0NjU1YmZl/MzY1NTBiNzE2Zjc4/LWljb25vLWRlLXRh/emEtZGUtaGVsYWRv/LnBuZw', // Reemplaza con la URL del logo
    nombre: 'Panaderia "El Panadero"',
    ubicacion: 'En algun lindo lugar',
    telefono: '400 000 00 00'
  };

  // Formatear las fechas para el encabezado del PDF
  const fechaInicioFormatted = new Date(fechaInicio).toLocaleDateString();
  const fechaFinFormatted = new Date(fechaFin).toLocaleDateString();

  // Agregar logo del negocio
  const img = new Image();
  img.src = negocioInfo.logo;
  img.onload = function () {
    const imgWidth = 15; // Ancho del logo en mm
    const imgHeight = img.height * imgWidth / img.width; // Mantener la proporción del logo
    const margin = 10; // Margen para el logo y la información
    const infoX = margin + imgWidth + 5; // Separación entre el logo y la información del negocio

    doc.addImage(img, 'PNG', 80 - imgWidth - margin, margin, imgWidth, imgHeight, '', 'FAST'); // Esquina derecha superior con margen

    // Agregar información del negocio
    doc.setFontSize(10);
    doc.setFont('Courier'); // Usar una fuente similar a la de los tickets
    doc.text(negocioInfo.nombre, margin, margin + 10);
    doc.text(negocioInfo.ubicacion, margin, margin + 15);
    doc.text(negocioInfo.telefono, margin, margin + 20);

    // Agregar título y rango de fechas al PDF
    doc.setFontSize(12);
    doc.text('Reporte de Ventas', 40, margin + imgHeight + 25, null, null, 'center');
    doc.setFontSize(10);
    doc.text(`Desde: ${fechaInicioFormatted}  Hasta: ${fechaFinFormatted}`, 40, margin + imgHeight + 30, null, null, 'center');

    // Crear una tabla temporal para convertir a imagen
    const tempTable = document.createElement('table');
    tempTable.innerHTML = `
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${currentRows.join('')}
        <tr>
          <td colspan="3" style="text-align: left;"><strong>Total Ventas:</strong></td>
          <td><strong>$${totalVentas.toFixed(2)}</strong></td>
        </tr>
      </tbody>
    `;
    tempTable.style.borderCollapse = 'collapse';
    tempTable.style.width = '100%';
    tempTable.style.fontSize = '10px';
    tempTable.style.position = 'absolute';
    tempTable.style.left = '-9999px';

    // Estilos CSS para la tabla
    const style = document.createElement('style');
    style.innerHTML = `
      table, th, td {
        border: 1px solid #000;
        padding: 5px;
        text-align: center;
      }
      th {
        background-color: #f2f2f2;
      }
      td:nth-child(3), td:nth-child(4) {
        width: 50px;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(tempTable);

    // Convertir la tabla a una imagen y agregarla al PDF
    html2canvas(tempTable).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 70;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const position = margin + imgHeight + 35;

      doc.addImage(imgData, 'PNG', 5, margin + imgHeight + 35, imgWidth, imgHeight);

      document.body.removeChild(tempTable);
      document.head.removeChild(style);

      const pdfName = `reporte_${Date.now()}.pdf`;

      // Crear un enlace para descargar el PDF
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', pdfName); 
      link.click();

      URL.revokeObjectURL(url);
    });
  };
}