let editIndex = null; // Índice del producto que se está editando

// Función para generar un ID único para cada producto
function generateUniqueId() {
  return 'product-' + Date.now();
}

// Evento al hacer clic en el botón de agregar producto
document.getElementById('addProduct').addEventListener('click', () => {
  const productImage = document.getElementById('productImage').files[0]; // Imagen del producto
  const productName = document.getElementById('productName').value; // Nombre del producto
  const productPrice = parseFloat(document.getElementById('productPrice').value); // Precio del producto
  const productStock = parseInt(document.getElementById('productStock').value); // Stock del producto

  // Verificar que todos los campos estén completos
  if (productImage && productName && !isNaN(productPrice) && !isNaN(productStock)) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const product = {
        id: generateUniqueId(),  // Asignar ID único
        image: event.target.result, // Imagen en base64
        name: productName,
        price: productPrice,
        stock: productStock
      };

      let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
      inventory.push(product);
      localStorage.setItem('inventory', JSON.stringify(inventory)); // Guardar inventario en localStorage

      displayInventory(); // Actualizar la visualización del inventario
      resetForm(); // Resetear el formulario
    };
    reader.readAsDataURL(productImage); // Leer la imagen como URL
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor complete todos los campos.'
    });
  }
});

// Evento al hacer clic en el botón de actualizar producto
document.getElementById('updateProduct').addEventListener('click', () => {
  const productImage = document.getElementById('productImage').files[0]; // Imagen del producto
  const productName = document.getElementById('productName').value; // Nombre del producto
  const productPrice = parseFloat(document.getElementById('productPrice').value); // Precio del producto
  const productStock = parseInt(document.getElementById('productStock').value); // Stock del producto

  // Verificar que los campos nombre, precio y stock estén completos
  if (productName && !isNaN(productPrice) && !isNaN(productStock)) {
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    // Si hay una nueva imagen, actualizarla
    if (productImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        inventory[editIndex] = {
          ...inventory[editIndex],
          image: event.target.result, // Nueva imagen en base64
          name: productName,
          price: productPrice,
          stock: productStock
        };
        localStorage.setItem('inventory', JSON.stringify(inventory)); // Guardar cambios en localStorage

        displayInventory(); // Actualizar la visualización del inventario
        resetForm(); // Resetear el formulario
      };
      reader.readAsDataURL(productImage); // Leer la imagen como URL
    } else {
      // Si no hay nueva imagen, solo actualizar los otros campos
      inventory[editIndex] = {
        ...inventory[editIndex],
        name: productName,
        price: productPrice,
        stock: productStock
      };
      localStorage.setItem('inventory', JSON.stringify(inventory)); // Guardar cambios en localStorage
      displayInventory(); // Actualizar la visualización del inventario
      resetForm(); // Resetear el formulario
    }
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor complete todos los campos.'
    });
  }
});

// Función para editar un producto
function editProduct(index) {
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
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
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  inventory.splice(index, 1); // Eliminar el producto del inventario
  localStorage.setItem('inventory', JSON.stringify(inventory)); // Guardar cambios en localStorage
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

  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  // Crear filas de la tabla para cada producto en el inventario
  inventory.forEach((product, index) => {
    const row = document.createElement('tr');

    const imageCell = document.createElement('td');
    const image = document.createElement('img');
    image.src = product.image;
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
    editButton.addEventListener('click', () => editProduct(index)); // Agregar evento para editar
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.classList.add('action-button', 'delete-button');
    deleteButton.addEventListener('click', () => deleteProduct(index)); // Agregar evento para eliminar
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);
    inventoryBody.appendChild(row); // Agregar la fila a la tabla
  });
}

// Mostrar el inventario al cargar la página
window.addEventListener('load', displayInventory);

// Observar cambios en el inventario para detectar productos agotados
const inventoryObserver = new MutationObserver(() => {
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
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