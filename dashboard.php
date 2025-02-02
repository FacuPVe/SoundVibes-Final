<?php
session_start();


// Validar que solo los usuarios de rol "user" pueden acceder
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'user') {
    header('Location: index.php');
    exit();
}

?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SoundVibes - Mood Music Player</title>
</head>
<script src="https://cdn.tailwindcss.com"></script>

<body class="font-mono bg-[#f0f4f8] text-gray-800 m-0 p-5 flex flex-col items-center">
    <!-- Botón de cerrar sesión para pantallas grandes -->
    <div class="hidden xl:block fixed top-4 right-4">
        <a href="logout.php"
            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
            Cerrar Sesión
        </a>
    </div>

    <div class="mood-jukebox-container flex flex-col items-center bg-white rounded-2xl p-3 sm:p-5 shadow-md max-w-[800px] w-[95%] sm:w-full mx-auto relative">
        <!-- Botón de cerrar sesión para pantallas pequeñas -->
        <div class="xl:hidden absolute top-4 right-4">
            <a href="logout.php"
                class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 sm:py-2 sm:px-4 rounded transition-colors duration-300 text-sm sm:text-base">
                Cerrar Sesión
            </a>
        </div>

        <div class="mood-selector mb-5 w-full text-center mt-12 xl:mt-0">
            <select id="mood-select" class="w-full p-2.5 text-base mb-2.5 rounded border border-gray-300">
                <option value="">--Selecciona tu Estado de Ánimo--</option>
                <option value="feliz">Feliz</option>
                <option value="triste">Triste</option>
                <option value="energetico">Energético</option>
                <option value="relajado">Relajado</option>
                <option value="inspirado">Inspirado</option>
                <option value="estresado">Estresado</option>
            </select>
        </div>

        <div id="player-container" class="player flex flex-col items-center w-full">
            <img id="song-image" src="./public/images/ui/default.png" alt="Song Art" 
                class="max-w-[300px] max-h-[300px] rounded-lg mb-4" />

            <div class="song-info">
                <div class="song-details">
                    <h3 id="song-title" class="text-lg font-bold">Título</h3>
                    <p id="song-artist" class="text-gray-600">Artista</p>
                </div>
            </div>

            <div class="controls flex justify-center items-center gap-2 sm:gap-5 my-4">
                <img id="prev" src="./public/images/ui/prev.png" alt="Anterior" 
                    class="w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] cursor-pointer hover:scale-110 transition-transform" />
                <img id="play-pause" src="./public/images/ui/play.png" alt="Reproducir/Pausar" 
                    class="w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] cursor-pointer hover:scale-110 transition-transform" />
                <img id="next" src="./public/images/ui/next.png" alt="Siguiente" 
                    class="w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] cursor-pointer hover:scale-110 transition-transform" />
            </div>

            <div class="sliders flex justify-center gap-5 w-full mb-4">
                <input type="range" id="seek-bar" min="0" max="100" value="0" 
                    class="w-[200px]">
                <input type="range" id="volume-control" min="0" max="1" step="0.01" value="0.5" 
                    class="w-[200px]">
            </div>

            <div id="song-list-container">
                <ul id="song-list" class="w-full max-h-[300px] overflow-y-auto mt-4">

                </ul>
            </div>

            <div id="equalizer-container" class="mt-4 w-full flex justify-center">
                <canvas id="equalizer" width="500" height="250"></canvas>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>
    <script src="./js/user-dashboard.js"></script>
</body>

</html>