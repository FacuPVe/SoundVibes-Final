<?php
session_start();

$usersFile = 'data/users.json'; // Archivo JSON que almacena usuarios.

// Asegurarse de que el archivo JSON existe.
if (!file_exists($usersFile)) {
    file_put_contents($usersFile, json_encode(['users' => []], JSON_PRETTY_PRINT));
}

/**
 * Lee los usuarios del archivo JSON
 * @param string $usersFile Ruta al archivo JSON de usuarios
 * @return array Array asociativo con los usuarios
 * @description Obtiene y decodifica los usuarios almacenados en el archivo JSON
 */
function readUsers($usersFile)
{
    $usersData = json_decode(file_get_contents($usersFile), true);
    return $usersData['users'] ?? [];
}

/**
 * Crea un nuevo usuario en el archivo JSON
 * @param string $usersFile Ruta al archivo JSON de usuarios
 * @param string $name Nombre del usuario
 * @param string $email Email del usuario
 * @param string $password Contraseña sin encriptar
 * @param string $role Rol del usuario ('user' o 'admin')
 * @return array Datos del usuario creado
 * @description Crea un nuevo usuario y lo almacena en el archivo JSON
 */
function createUser($usersFile, $name, $email, $password, $role)
{
    $usersData = json_decode(file_get_contents($usersFile), true);

    $newUser = [
        'id' => uniqid(),
        'name' => htmlspecialchars($name),
        'email' => filter_var($email, FILTER_VALIDATE_EMAIL),
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'role' => $role
    ];

    $usersData['users'][] = $newUser;
    file_put_contents($usersFile, json_encode($usersData, JSON_PRETTY_PRINT));

    return $newUser;
}

/**
 * Actualiza la información de un usuario existente
 * @param string $usersFile Ruta al archivo JSON de usuarios
 * @param string $id ID del usuario a actualizar
 * @param string $name Nuevo nombre
 * @param string $email Nuevo email
 * @param string $role Nuevo rol
 * @return void
 * @description Actualiza los datos de un usuario en el archivo JSON
 */
function updateUser($usersFile, $id, $name, $email, $role)
{
    $usersData = json_decode(file_get_contents($usersFile), true);

    foreach ($usersData['users'] as &$user) {
        if ($user['id'] === $id) {
            $user['name'] = htmlspecialchars($name);
            $user['email'] = filter_var($email, FILTER_VALIDATE_EMAIL);
            $user['role'] = $role;
            break;
        }
    }

    file_put_contents($usersFile, json_encode($usersData, JSON_PRETTY_PRINT));
}

/**
 * Elimina un usuario del sistema
 * @param string $usersFile Ruta al archivo JSON de usuarios
 * @param string $id ID del usuario a eliminar
 * @return void
 * @description Elimina un usuario del archivo JSON basado en su ID
 */
function deleteUser($usersFile, $id)
{
    $usersData = json_decode(file_get_contents($usersFile), true);

    $usersData['users'] = array_filter($usersData['users'], fn($user) => $user['id'] !== $id);

    file_put_contents($usersFile, json_encode($usersData, JSON_PRETTY_PRINT));
}

// Validar que solo los usuarios de rol "admin" pueden acceder
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: index.php');
    exit();
}

// Manejo de funciones Create, Update, Delete).
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Indicar el tipo de respuesta a JSON.
    header('Content-Type: application/json');
    $action = $_POST['action'] ?? null;

    // Se cambia el header('Location: admin.php'); de todas las acciones por un JSON para trabajar con javascript.
    if ($action === 'create') {
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $role = $_POST['role'] ?? 'user';

        $newUser = createUser($usersFile, $name, $email, $password, $role);
        echo json_encode([
            "status" => "success", 
            "message" => "Usuario creado correctamente",
            "userId" => $newUser['id']
        ]);
        exit();
    }

    if ($action === 'update') {
        $id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $role = $_POST['role'] ?? 'user';

        updateUser($usersFile, $id, $name, $email, $role);
        // header('Location: admin.php'); 
        echo json_encode(["status" => "success", "message" => "Usuario actualizado correctamente"]);
        exit();
    }

    if ($action === 'delete') {
        $id = $_POST['id'] ?? '';

        deleteUser($usersFile, $id);
        // header('Location: admin.php'); 
        echo json_encode(["status" => "success", "message" => "Usuario eliminado correctamente"]);
        exit();
    }
}

// Obtener la lista de usuarios para mostrarla en la tabla.
$users = readUsers($usersFile);

?>

<!DOCTYPE html>
<html>

<head>
    <title>Panel de administración</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="./css/styles.css">
</head>

<body class="bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center min-h-screen">
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div class="bg-white shadow-xl rounded-lg overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 class="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
                    <a href="logout.php"
                        class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                        Cerrar Sesión
                    </a>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                <div
                    class="md:col-span-2 bg-gray-50 rounded-lg p-6 shadow-md transition transform hover:scale-[1.01] duration-300">
                    <h2 class="text-2xl font-semibold mb-4 text-gray-800">User Management</h2>
                    <div class="overflow-x-auto -mx-4 sm:mx-0">
                        <div class="inline-block min-w-full align-middle">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-blue-100 text-gray-700">
                                    <tr>
                                        <th class="p-3">ID</th>
                                        <th class="p-3">Name</th>
                                        <th class="p-3">Email</th>
                                        <th class="p-3">Role</th>
                                        <th class="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($users as $user): ?>
                                        <tr data-id="<?= $user['id'] ?>" class="border-b hover:bg-blue-50 transition duration-200">
                                            <td class="p-3"><?= $user['id'] ?></td>
                                            <td class="p-3 username"><?= $user['name'] ?></td>
                                            <td class="p-3 user-email"><?= $user['email'] ?></td>
                                            <td class="p-3 user-role">
                                                <span class="px-2 py-1 rounded-full 
                                                <?= $user['role'] == 'admin'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800' ?> 
                                                text-xs">
                                                    <?= $user['role'] ?>
                                                </span>
                                            </td>
                                            <td class="p-3">
                                                <div class="flex space-x-2">
                                                    <form class="inline delete-user-form">
                                                        <input type="hidden" name="id" value="<?= $user['id'] ?>">
                                                        <input type="hidden" name="action" value="delete">
                                                        <button type="submit"
                                                            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300">
                                                            Delete
                                                        </button>
                                                    </form>
                                                    <button
                                                        onclick="editUser('<?= $user['id'] ?>', '<?= $user['name'] ?>', '<?= $user['email'] ?>', '<?= $user['role'] ?>')"
                                                        class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300">
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-6 shadow-md transform transition hover:scale-[1.02] duration-300">
                    <h2 class="text-2xl font-semibold mb-4 text-gray-800">Add User</h2>
                    <form id="createUserForm" class="space-y-4">
                        <input type="hidden" name="action" value="create">

                        <div>
                            <label class="block text-gray-700 mb-2">Name</label>
                            <input type="text" name="name"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required>
                        </div>

                        <div>
                            <label class="block text-gray-700 mb-2">Email</label>
                            <input type="email" name="email"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required>
                        </div>

                        <div>
                            <label class="block text-gray-700 mb-2">Password</label>
                            <input type="password" name="password"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required>
                        </div>

                        <div>
                            <label class="block text-gray-700 mb-2">Role</label>
                            <select name="role"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-md 
                        hover:from-green-600 hover:to-blue-600 transition duration-300 transform hover:scale-[1.02]">
                            Add User
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="./js/admin.js"></script>