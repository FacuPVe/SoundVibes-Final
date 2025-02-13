<?php
session_start();

// Comentario puesto desde Raspberry PI

// Comentario puesto desde VisualCode estando conectado a la Raspberry PI

// Ruta de .json donde se encuentran los usuarios
$usersFile = 'data/users.json';

// Comprobar y gestionar los datos introducidos por el usuario para iniciar sesión
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Se guardan en variables los datos introducidos en el formulario
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Se obtienen todos los datos que hay en users.json y se guardan en la variable "usersData"
    $usersData = json_decode(file_get_contents($usersFile), true);

    $authenticatedUser = null;
    // Hacer iteración sobre cada usuario para comprobar cuáles datos de los usuarios concuerdan con los que han sido introducidos
    foreach ($usersData['users'] as $user) {
        if ($user['email'] === $email && password_verify($password, $user['password'])) {
            $authenticatedUser = $user;
            break;
        }
    }

    // Condicional para almacenar en sesiones los datos introducidos
    if ($authenticatedUser) {
        $_SESSION['user_id'] = $authenticatedUser['id'];
        $_SESSION['username'] = $authenticatedUser['name'];
        $_SESSION['role'] = $authenticatedUser['role'];

        setcookie('user_role', $authenticatedUser['role'], time() + (86400 * 30), "/");

        if ($authenticatedUser['role'] === 'admin') {
            header('Location: admin.php');
        } else {
            header('Location: dashboard.php');
        }
        exit();
    } else {
        $error = "Invalid credentials";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>SoundVibes - Login</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center min-h-screen p-4">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md transform transition-all hover:scale-105 hover:shadow-2xl overflow-hidden p-6 sm:p-8">
        <div class="w-full">
            <div class="text-center">
                <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-4">¡Bienvenido a <span class="text-indigo-500">SoundVibes!</span></h2>
                <p class="text-gray-500 mb-6">Inicia sesión para acceder a tu cuenta</p>
            </div>
            <?php if(isset($error)): ?>
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6" role="alert">
                    <p class="font-bold">Error</p>
                    <p><?php echo $error; ?></p>
                </div>
            <?php endif; ?>
            <form method="POST" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300 focus:border-indigo-500 transition" placeholder="example@mail.com" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300 focus:border-indigo-500 transition" placeholder="••••••••" required>
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg hover:opacity-90 shadow-lg transition-all transform hover:scale-105">
                    Login
                </button>
            </form>
        <!-- En caso de que al final se añada de algúna forma un registro (se podría añadir para hacer que los usuarios que se registren en la página de registro tengan de rol predeterminado "user")
        <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">No tienes cuenta? 
                <a href="#" class="text-blue-500 font-medium hover:underline">Sign up</a>
            </p>
        </div>
        -->
    </div>
</body>
</html>
