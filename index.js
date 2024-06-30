window.addEventListener('load', () => {
  // Verificar conexión a internet
  if (navigator.onLine) {
    // Si hay conexión, ocultar el splash screen después de cargar
    hideSplashScreen();
  } else {
    // Si no hay conexión, mostrar el splash screen hasta que haya conexión
    document.getElementById('splash-screen').style.display = 'flex'; // Mostrar el splash screen
    window.addEventListener('online', () => {
      // Cuando haya conexión, ocultar el splash screen
      hideSplashScreen();
    });
  }
});

function hideSplashScreen() {
  document.getElementById('splash-screen').style.opacity = '0'; // Aplicar transición para desvanecer el splash screen
  setTimeout(() => {
    document.getElementById('splash-screen').style.display = 'none'; // Ocultar el splash screen después de la transición
  }, 500); // Tiempo coincidente con la transición en CSS
}



document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const sales = JSON.parse(localStorage.getItem('sales')) || [];
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  const cartIcon = document.getElementById('cart-icon');
  const cartCount = document.getElementById('cart-count');
  const modal = document.getElementById('cart-modal');
  const closeModal = document.querySelector('.close');
  const cartEmptyMessage = document.getElementById('cart-empty-message');
  const emptyCartButton = document.getElementById('empty-cart');
  const checkoutButton = document.getElementById('checkout');

  function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceContainer = document.getElementById('total-price');
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (cart.length === 0) {
      cartEmptyMessage.style.display = 'block';
      emptyCartButton.disabled = true;
      checkoutButton.disabled = true;
    } else {
      cartEmptyMessage.style.display = 'none';
      emptyCartButton.disabled = false;
      checkoutButton.disabled = false;
    }

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

  function displayMainProducts() {
    const productsSection = document.getElementById('products');
    productsSection.innerHTML = '';

    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    if (inventory.length === 0) {
      const noProductsMessage = document.createElement('div');
      noProductsMessage.classList.add('no-products-message');
      noProductsMessage.innerHTML = `
      <div class="message-container">
      <i class="fas fa-box-open"></i>
        <p>No hay productos disponibles.</p>
      </div>
      `;
      productsSection.appendChild(noProductsMessage);
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
        <h3>${product.name}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button class="add-to-cart"><i class="fas fa-cart-plus"></i> Agregar <div class="spinner" style="display: none;"></div></button>
      `;

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
                alert('No hay suficiente stock disponible para este producto.');
              }
            } else {
              cart.push({ id: productId, name: productName, price: productPrice, quantity: 1, image: productImage });
            }

          localStorage.setItem('cart', JSON.stringify(cart));
          updateCart();

          } else if (!inventoryItem) {
            alert('El producto no está disponible en el inventario.');
          } else {
            alert('No hay suficiente stock disponible para este producto.');
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
}

  cartIcon.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });

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
        alert('Producto insuficiente en el inventario.');
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

  document.getElementById('empty-cart').addEventListener('click', () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción vaciará todo el carrito.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, vaciar carrito',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        cart.length = 0;
        localStorage.removeItem('cart');
        updateCart();
        Swal.fire(
          'Carrito vaciado',
          'Tu carrito ha sido vaciado.',
          'success'
        )
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

  checkoutButton.addEventListener('click', () => {
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

    Swal.fire({
      title: 'Compra guardada',
      text: 'Su compra se ha guardado con éxito.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  });

  displayMainProducts();
  updateCart();
});










document.getElementById('generar-reporte').addEventListener('click', function() {
  const fechaInicio = document.getElementById('fecha-inicio').value;
  const fechaFin = document.getElementById('fecha-fin').value;

  // validacion de fechas
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);

  if (!fechaInicio || !fechaFin) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, seleccione ambas fechas.',
    });
    return;
  }

  if (fechaInicioObj > fechaFinObj) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La fecha de inicio no puede ser posterior a la fecha fin.',
    });
    return;
  }

  generarReporte(fechaInicio, fechaFin);
});

const rowsPerPage = 6;
let currentPage = 1;
let currentRows = [];

function generarReporte(fechaInicio, fechaFin) {
  const sales = JSON.parse(localStorage.getItem('sales')) || [];
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    saleDate.setHours(0, 0, 0, 0);
    fin.setDate(fin.getDate() + 1);

    return saleDate >= inicio && saleDate <= fin;
  });

  if (filteredSales.length === 0) {
    document.querySelector('#reporte-tabla tbody').innerHTML = '<tr><td colspan="5">No se encontraron resultados.</td></tr>';
    document.getElementById('total-ventas').innerHTML = '';
		document.getElementById('pagination').innerHTML = '';
    return;
  }

  let totalVentas = 0;
  const rows = [];

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

	currentRows = rows;
  currentPage = 1; // Reset to first page when new report is generated
  renderTable();
  renderPagination();

  const totalVentasDiv = document.getElementById('total-ventas');
  totalVentasDiv.innerHTML = `<strong>Total Ventas: $${totalVentas.toFixed(2)}</strong>`;

  generarPDF(fechaInicio, fechaFin, totalVentas);
}

function renderTable(rows) {
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = currentRows.slice(startIndex, endIndex).join('');

  document.querySelector('#reporte-tabla tbody').innerHTML = paginatedRows;
}

function renderPagination() {
  const pageCount = Math.ceil(currentRows.length / rowsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const prevButton = document.createElement('li');
  prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevButton.innerHTML = `<a class="page-link" href="#">Ant.</a>`;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
      renderPagination();
    }
  });
  pagination.appendChild(prevButton);

  for (let i = 1; i <= pageCount; i++) {
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener('click', () => {
      currentPage = i;
      renderTable();
      renderPagination();
    });
    pagination.appendChild(pageItem);
  }

  const nextButton = document.createElement('li');
  nextButton.className = `page-item ${currentPage === pageCount ? 'disabled' : ''}`;
  nextButton.innerHTML = `<a class="page-link" href="#">Sig.</a>`;
  nextButton.addEventListener('click', () => {
    if (currentPage < pageCount) {
      currentPage++;
      renderTable();
      renderPagination();
    }
  });
  pagination.appendChild(nextButton);
}

function generarPDF(fechaInicio, fechaFin, totalVentas) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 297]
  });

  const fechaInicioFormatted = new Date(fechaInicio).toLocaleDateString();
  const fechaFinFormatted = new Date(fechaFin).toLocaleDateString();

  // Encabezado
  doc.setFontSize(18);
  doc.text('Reporte de Ventas', 40, 10, null, null, 'center');
  doc.setFontSize(12);
  doc.text(`Desde: ${fechaInicioFormatted}  Hasta: ${fechaFinFormatted}`, 40, 20, null, null, 'center');
  

  // Crear una tabla temporal para convertirla en una imagen
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
  tempTable.style.fontSize = '12px';
  tempTable.style.position = 'absolute'; // Asegura que la tabla no sea visible
  tempTable.style.left = '-9999px'; // Asegura que la tabla no sea visible

  const style = document.createElement('style');
  style.innerHTML = `
    table, th, td {
      border: 1px solid #fff;
      padding: 8px;
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
  

    html2canvas(tempTable).then(canvas => {
      var imgData = canvas.toDataURL('image/png');
      var imgWidth = 70; // Ancho de la imagen en mm (ajusta según sea necesario)
      var pageHeight = 297;  // Altura de la página en mm (ajusta según sea necesario)
      var imgHeight = canvas.height * imgWidth / canvas.width;

      // Calcular la posición horizontal para centrar la imagen
      var centerX = (doc.internal.pageSize.width - imgWidth) / 2;
      var position = 30;

      doc.addImage(imgData, 'PNG', centerX, position, imgWidth, imgHeight);

      // Remover la tabla temporal
      document.body.removeChild(tempTable);
      document.head.removeChild(style);

      // Pie de página
      //doc.setFontSize(14);
      //doc.text(`Total Ventas: $${totalVentas.toFixed(2)}`, 40, doc.internal.pageSize.height - 20, null, null, 'center');

      doc.save('reporte.pdf');
    });
  }