window.addEventListener('load', () => {
  const isFirstVisit = localStorage.getItem('isFirstVisit') === null;

  if (isFirstVisit) {
    // Marcar que el usuario ya visitó la página
    localStorage.setItem('isFirstVisit', 'false');

  setTimeout(() => {
    // Aplicar transición para desvanecer el splash screen
    document.getElementById('splash-screen').style.opacity = '0';
    setTimeout(() => {
      // Ocultar el splash screen después de la transición
      document.getElementById('splash-screen').style.display = 'none';
    }, 500); // Tiempo coincidente con la transición en CSS
  }, 2000); // 3000 ms = 3 segundos

} else {
   // Si no es la primera visita, ocultar el splash screen inmediatamente
   document.getElementById('splash-screen').style.display = 'none';

   // Agregar clase al body para mostrar contenido principal
   document.body.classList.add('show-content');
}

});


document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const sales = JSON.parse(localStorage.getItem('sales')) || [];

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
          img.src = `img/${item.image}`;
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

  document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', () => {
        const spinner = button.querySelector('.spinner');
        const icon = button.querySelector('.fas');

        //mostrar spinner y ocultar icono
        spinner.style.display = 'inline-block';
        icon.style.display = 'none';
        button.disabled = true;

        // simular una operación asincrona con SetTimeout
        setTimeout(() => {
          const product = button.parentElement;
          const productId = product.getAttribute('data-id');
          const productName = product.getAttribute('data-name');
          const productPrice = parseFloat(product.getAttribute('data-price'));
          const productImage = product.getAttribute('data-image');

          const existingItem = cart.find(item => item.id === productId);
          if (existingItem) {
              existingItem.quantity++;
          } else {
              cart.push({ id: productId, name: productName, price: productPrice, quantity: 1, image: productImage });
          }

          localStorage.setItem('cart', JSON.stringify(cart));
          updateCart();

          // ocultar spinner y mostrar icono
          spinner.style.display = 'none';
          icon.style.display = 'inline-block';
          button.disabled = false;
        }, 1000); // simular un retraso de 1 segundo
      });
  });

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
          cart[index].quantity++;
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCart();
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

  checkoutButton.addEventListener('click', () => {
      const sale = {
          date: new Date().toISOString(),  // Almacenar fecha en formato ISO
          items: [...cart],
          total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };

      sales.push(sale);
      localStorage.setItem('sales', JSON.stringify(sales));
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

updateGenerarReporteButton();