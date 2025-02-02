/**
 * Abre un modal para editar la información del usuario
 * @param {number} id - ID del usuario
 * @param {string} name - El nombre del usuario
 * @param {string} email - El correo electrónico del usuario
 * @param {string} role - El rol del usuario ("user" o "admin")
 * @returns {void} - No retorna valor
 * @description Crea y muestra un formulario modal para editar los detalles del usuario
 * incluyendo nombre, correo electrónico y rol. El formulario incluye validación y
 * maneja tanto el envío como la cancelación.
 */
function editUser(id, name, email, role) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

    modalOverlay.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 transform transition-all scale-95 hover:scale-100">
            <h2 class="text-xl font-bold mb-4 text-gray-800">Edit User</h2>
            <form id="editUserForm" class="space-y-4">
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" value="${id}">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" name="name" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300 focus:border-indigo-500 transition" value="${name}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300 focus:border-indigo-500 transition" value="${email}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select name="role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300 focus:border-indigo-500 transition" required>
                        <option value="user" ${role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">Save Changes</button>
                    <button type="button" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition" id="cancelButton">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);

    // Event listeners
    document.getElementById('cancelButton').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });

    document.getElementById('editUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const response = await fetch('admin.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.status === 'success') {
                showNotification(result.message, 'success');
                document.body.removeChild(modalOverlay);
                updateUserRow(formData.get('id'), formData.get('name'), formData.get('email'), formData.get('role'));
            }
        } catch (error) {
            showNotification('Error updating user', 'error');
        }
    });
}

/**
 * Muestra una notificación de lo sucedido al usuario en la parte superior derecha de la pantalla
 * @param {string} message - El mensaje a mostrar
 * @param {string} type - El tipo de notificación ('success' o 'error')
 * @returns {void} - No retorna valor
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white z-50 transform transition-all duration-300 translate-y-0`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Actualiza la fila de un usuario en la tabla
 * @param {number} id - El ID del usuario
 * @param {string} name - El nuevo nombre del usuario
 * @param {string} email - El nuevo correo electrónico
 * @param {string} role - El nuevo rol del usuario
 * @returns {void} - No retorna valor
 */
function updateUserRow(id, name, email, role) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.querySelector('.username').textContent = name;
        row.querySelector('.user-email').textContent = email;
        row.querySelector('.user-role').innerHTML = `
            <span class="px-2 py-1 rounded-full ${
                role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            } text-xs">
                ${role}
            </span>
        `;
    }
}

/**
 * Crea una nueva fila HTML para la tabla de usuarios
 * @param {Object} userData - Objeto con los datos del usuario
 * @param {number} userData.id - ID del usuario
 * @param {string} userData.name - Nombre del usuario
 * @param {string} userData.email - Correo electrónico del usuario
 * @param {string} userData.role - Rol del usuario ("user" o "admin")
 * @returns {string} - HTML de la fila de la tabla
 * @description Genera el HTML para una nueva fila en la tabla de usuarios
 * incluyendo los botones de edición y eliminación
 */
function createUserRow(userData) {
    return `
        <tr data-id="${userData.id}" class="border-b hover:bg-blue-50 transition duration-200">
            <td class="p-3">${userData.id}</td>
            <td class="p-3 username">${userData.name}</td>
            <td class="p-3 user-email">${userData.email}</td>
            <td class="p-3 user-role">
                <span class="px-2 py-1 rounded-full ${
                    userData.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                } text-xs">
                    ${userData.role}
                </span>
            </td>
            <td class="p-3">
                <div class="flex space-x-2">
                    <form class="inline delete-user-form">
                        <input type="hidden" name="id" value="${userData.id}">
                        <input type="hidden" name="action" value="delete">
                        <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300">
                            Delete
                        </button>
                    </form>
                    <button onclick="editUser('${userData.id}', '${userData.name}', '${userData.email}', '${userData.role}')"
                        class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300">
                        Edit
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Maneja el formulario de creación de nuevos usuarios
 * @returns {void} - No retorna valor
 * @description Configura los event listeners para el formulario de creación
 * y maneja el proceso de creación de nuevos usuarios, incluyendo la
 * actualización de la UI y notificaciones
 */
function handleCreateForm() {
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            try {
                const response = await fetch('admin.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    showNotification(result.message, 'success');
                    e.target.reset();
                    
                    // Crear nuevo usuario con los datos del formulario
                    const newUser = {
                        id: result.userId, 
                        name: formData.get('name'),
                        email: formData.get('email'),
                        role: formData.get('role')
                    };
                    
                    // Añadir la nueva fila a la tabla
                    const tbody = document.querySelector('table tbody');
                    tbody.insertAdjacentHTML('beforeend', createUserRow(newUser));
                    
                    // Añadir event listener para el nuevo botón de eliminar
                    const newRow = tbody.lastElementChild;
                    setupDeleteHandler(newRow.querySelector('.delete-user-form'));
                }
            } catch (error) {
                showNotification('Error creating user', 'error');
            }
        });
    }
}

/**
 * Configura el manejador de eventos para el formulario de eliminación
 * @param {HTMLFormElement} form - El elemento formulario que contiene la información de eliminación
 * @returns {Promise<void>} - Promesa que se resuelve cuando se completa la operación
 */
function setupDeleteHandler(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this user?')) {
            const formData = new FormData(e.target);
            
            try {
                const response = await fetch('admin.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    showNotification(result.message, 'success');
                    const row = e.target.closest('tr');
                    if (row) {
                        row.remove();
                    }
                }
            } catch (error) {
                showNotification('Error deleting user', 'error');
            }
        }
    });
}

/**
 * Inicializa los manejadores de eventos cuando el DOM está listo
 * @description Configura los event listeners iniciales para los formularios
 * de eliminación existentes y el formulario de creación
 */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.delete-user-form').forEach(setupDeleteHandler);
    
    handleCreateForm();
});

