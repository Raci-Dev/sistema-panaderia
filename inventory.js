let editIndex = null; // Índice del producto que se está editando
let CurrentPage = 1;
const ItemsPerPage = 4;
let inventory = []; // Inventario cargado de localStorage

// Función para generar un ID único para cada producto
function generateUniqueId() {
  return 'product-' + Date.now();
}

// Función de validación de datos
function validateProductData(productName, productPrice, productStock, productImage) {
  if (!productName || productName.trim() === "") {
    return "El nombre del producto no puede estar vacío.";
  }
  if (isNaN(productPrice) || productPrice <= 0) {
    return "El precio del producto debe ser un número positivo.";
  }
  if (isNaN(productStock) || productStock < 0) {
    return "El stock del producto debe ser un número no negativo.";
  }
  if (productImage && !productImage.type.startsWith('image/')) {
    return "El archivo debe ser una imagen.";
  }
  return null;
}

// Función para cargar el inventario desde localStorage
function loadInventory() {
  inventory = JSON.parse(localStorage.getItem('inventory')) || [];
}

// Función para guardar el inventario en localStorage
function saveInventory() {
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Evento al hacer clic en el botón de agregar producto
document.getElementById('addProduct').addEventListener('click', () => {
  const productImage = document.getElementById('productImage').files[0]; // Imagen del producto
  const productName = document.getElementById('productName').value; // Nombre del producto
  const productPrice = parseFloat(document.getElementById('productPrice').value); // Precio del producto
  const productStock = parseInt(document.getElementById('productStock').value); // Stock del producto

  const validationError = validateProductData(productName, productPrice, productStock, productImage);

  if (validationError) {
    Swal.fire({
      icon: 'warning',
      title: 'Error',
      text: validationError
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const product = {
      id: generateUniqueId(),
      image: event.target.result,
      name: productName,
      price: productPrice,
      stock: productStock
    };

    inventory.push(product);
    saveInventory();
    displayInventory();
    resetForm();
  };
  reader.readAsDataURL(productImage);
});

// Evento al hacer clic en el botón de actualizar producto
document.getElementById('updateProduct').addEventListener('click', () => {
  const productImage = document.getElementById('productImage').files[0]; // Imagen del producto
  const productName = document.getElementById('productName').value; // Nombre del producto
  const productPrice = parseFloat(document.getElementById('productPrice').value); // Precio del producto
  const productStock = parseInt(document.getElementById('productStock').value); // Stock del producto

  const validationError = validateProductData(productName, productPrice, productStock, productImage);

  if (validationError) {
    Swal.fire({
      icon: 'warning',
      title: 'Error',
      text: validationError
    });
    return;
  }
  
  if (productImage) {
    const reader = new FileReader();
    reader.onload = (event) => {
      inventory[editIndex] = {
        ...inventory[editIndex],
        image: event.target.result,
        name: productName,
        price: productPrice,
        stock: productStock
      };
      saveInventory();
      displayInventory();
      resetForm();
    };
    reader.readAsDataURL(productImage);
  } else {
    inventory[editIndex] = {
      ...inventory[editIndex],
      name: productName,
      price: productPrice,
      stock: productStock
    };
    saveInventory();
    displayInventory();
    resetForm();
  }
});

// Función para editar un producto
function editProduct(index) {
  const product = inventory[index];

  // Llenar el formulario con los datos del producto a editar
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;

  // Mostrar el botón de actualizar y ocultar el de agregar
  document.getElementById('addProduct').style.display = 'none';
  document.getElementById('updateProduct').style.display = 'block';

  editIndex = index; // Guardar el índice del producto que se está editando
}

// Función para eliminar un producto
function deleteProduct(index) {
  inventory.splice(index, 1); // Eliminar el producto del inventario
  saveInventory();
  displayInventory(); // Actualizar la visualización del inventario
}

// Función para resetear el formulario
function resetForm() {
  document.getElementById('productImage').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';

  // Mostrar el botón de agregar y ocultar el de actualizar
  document.getElementById('addProduct').style.display = 'block';
  document.getElementById('updateProduct').style.display = 'none';

  editIndex = null; // Resetear el índice de edición
}

// Función para mostrar el inventario
function displayInventory() {
  const inventoryBody = document.getElementById('inventoryBody');
  inventoryBody.innerHTML = '';

  const totalPages = Math.ceil(inventory.length / ItemsPerPage);
  const startIndex = (CurrentPage - 1) * ItemsPerPage;
  const endIndex = startIndex + ItemsPerPage;

  const paginatedInventory = inventory.slice(startIndex, endIndex);

  paginatedInventory.forEach((product, index) => {
    const row = document.createElement('tr');

    const imageCell = document.createElement('td');
    const image = document.createElement('img');
    image.src = product.image;
    image.loading = 'lazy';
    image.classList.add('inventory-image');
    imageCell.appendChild(image);
    row.appendChild(imageCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = product.name;
    row.appendChild(nameCell);

    const priceCell = document.createElement('td');
    priceCell.textContent = product.price.toFixed(2);
    row.appendChild(priceCell);

    const stockCell = document.createElement('td');
    stockCell.textContent = product.stock;
    row.appendChild(stockCell);

    const actionsCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.classList.add('action-button', 'edit-button');
    editButton.addEventListener('click', () => editProduct(index + startIndex));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.classList.add('action-button', 'delete-button');
    deleteButton.addEventListener('click', () => deleteProduct(index + startIndex));
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);
    inventoryBody.appendChild(row);
  });

  updatePaginationControls(totalPages);
}

// Función para actualizar los controles de paginación
function updatePaginationControls(totalPages) {
  const paginationControls = document.getElementById('paginationControls');
  paginationControls.innerHTML = '';

  // Botón Anterior
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Anterior';
  prevButton.disabled = CurrentPage === 1;
  prevButton.addEventListener('click', () => {
    CurrentPage--;
    displayInventory();
  });
  paginationControls.appendChild(prevButton);

  // Botones de páginas
  for (let i = 1; i <= totalPages; i++) {
    if (i === CurrentPage || i === CurrentPage - 1 || i === CurrentPage + 1 || i === 1 || i === totalPages) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.toggle('active', i === CurrentPage);
      pageButton.addEventListener('click', () => {
        CurrentPage = i;
        displayInventory();
      });
      paginationControls.appendChild(pageButton);
    } else if (i === CurrentPage - 2 || i === CurrentPage + 2) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      paginationControls.appendChild(ellipsis);
    }
  }

  // Botón Siguiente
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Siguiente';
  nextButton.disabled = CurrentPage === totalPages;
  nextButton.addEventListener('click', () => {
    CurrentPage++;
    displayInventory();
  });
  paginationControls.appendChild(nextButton);
}

// Mostrar el inventario al cargar la página
window.addEventListener('load', () => {
  loadInventory();
  displayInventory();
});

// Observar cambios en el inventario para detectar productos agotados
const inventoryObserver = new MutationObserver(() => {
  inventory.forEach(product => {
    if (product.stock === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Productos agotados',
        text: `No hay suficiente stock disponible.`
      });
    }
  });
});

inventoryObserver.observe(document.getElementById('inventoryBody'), {
  childList: true,
  subtree: true
});