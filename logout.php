<?php
session_start();

session_destroy();

if (isset($_COOKIE['user_role'])) {
    setcookie('user_role', '', time() - 3600, '/');
}

header('Location: index.php');
exit(); 