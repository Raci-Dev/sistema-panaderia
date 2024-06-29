let editIndex = null;

// Función para generar un ID único
function generateUniqueId() {
  return 'product-' + Date.now();
}

document.getElementById('addProduct').addEventListener('click', () => {
  const productImage = document.getElementById('productImage').files[0];
  const productName = document.getElementById('productName').value;
  const productPrice = parseFloat(document.getElementById('productPrice').value);
  const productStock = parseInt(document.getElementById('productStock').value);

  if (productImage && productName && !isNaN(productPrice) && !isNaN(productStock)) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const product = {
        id: generateUniqueId(),  // Agregar ID único
        image: event.target.result,
        name: productName,
        price: productPrice,
        stock: productStock
      };

      let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
      inventory.push(product);
      localStorage.setItem('inventory', JSON.stringify(inventory));

      displayInventory();
      // Limpiar los campos del formulario
      document.getElementById('productImage').value = '';
      document.getElementById('productName').value = '';
      document.getElementById('productPrice').value = '';
      document.getElementById('productStock').value = '';
    };
    reader.readAsDataURL(productImage);
  } else {
    alert('Por favor complete todos los campos.');
  }
});

document.getElementById('updateProduct').addEventListener('click', () => {
  const productImage = document.getElementById('productImage').files[0];
  const productName = document.getElementById('productName').value;
  const productPrice = parseFloat(document.getElementById('productPrice').value);
  const productStock = parseInt(document.getElementById('productStock').value);

  if (productName && !isNaN(productPrice) && !isNaN(productStock)) {
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

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
        localStorage.setItem('inventory', JSON.stringify(inventory));


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
      localStorage.setItem('inventory', JSON.stringify(inventory));


      displayInventory();
      resetForm();
    }
  } else {
    alert('Por favor complete todos los campos.');
  }
});

function editProduct(index) {
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  const product = inventory[index];

  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;

  document.getElementById('addProduct').style.display = 'none';
  document.getElementById('updateProduct').style.display = 'block';

  editIndex = index;
}

function deleteProduct(index) {
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  inventory.splice(index, 1);
  localStorage.setItem('inventory', JSON.stringify(inventory));
  displayInventory();
}

function resetForm() {
  document.getElementById('productImage').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';

  document.getElementById('addProduct').style.display = 'block';
  document.getElementById('updateProduct').style.display = 'none';

  editIndex = null;
}


function displayInventory() {
  const inventoryBody = document.getElementById('inventoryBody');
  inventoryBody.innerHTML = '';

  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

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
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', () => editProduct(index));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.addEventListener('click', () => deleteProduct(index));
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);
    inventoryBody.appendChild(row);
  });

  // Actualizar los productos en la página principal
  displayMainProducts();
}

// Mostrar el inventario al cargar la página
window.addEventListener('load', displayInventory);
