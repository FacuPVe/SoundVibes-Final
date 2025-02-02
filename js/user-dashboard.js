let songs = [];
let currentTrack = null;
let songIndex = 0;
let isPlaying = false;
let songVolume = 0.5;
let analyser, bufferLength, dataArray;
let canvas = document.getElementById('equalizer');
let ctx = canvas.getContext('2d');
let seekBar = document.getElementById('seek-bar');
let moodSelect = document.getElementById('mood-select');

/**
 * Obtiene los datos de las canciones desde el archivo JSON
 * @returns {Promise<Object>} Objeto con las canciones agrupadas por estado de ánimo
 * @description Realiza una petición fetch al archivo songsData.json y devuelve los datos
 */
async function fetchSongsData() {
    try {
        const response = await fetch('./data/songsData.json');
        if (!response.ok) {
            throw new Error('Failed to fetch songs data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading songs data:', error);
        return {};
    }
}

/**
 * Actualiza la lista de canciones según el estado de ánimo seleccionado
 * @param {string} mood - Estado de ánimo seleccionado
 * @returns {Promise<void>}
 * @description Actualiza la UI con las canciones del estado de ánimo seleccionado
 */
async function updateSongList(mood) {
    const songList = document.getElementById('song-list');
    
    if (currentTrack) {
        stopTrack();
        if (analyser) {
            analyser.disconnect();
            analyser = null;
        }
    }
    
    if (!mood) {
        songs = [];
        songList.innerHTML = '';
        resetPlayer();
        return;
    }
    
    const songsData = await fetchSongsData();
    songs = songsData[mood] || [];
    
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    songList.innerHTML = '';

    analyser = null;
    bufferLength = null;
    dataArray = null;
    
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = `${song.title} - ${song.artist}`;
        li.className = "cursor-pointer p-2.5 border-b border-gray-200 hover:bg-gray-100 transition-colors duration-300";
        li.addEventListener('click', () => {
            stopTrack();
            loadTrack(index);
            playTrack();
        });
        songList.appendChild(li);
    });

    if (songs.length > 0) {
        loadTrack(0);
    }
}

moodSelect.addEventListener('change', (e) => {
    const mood = e.target.value;
    
    document.body.style.backgroundColor = mood ? getMoodColor(mood) : "#f0f4f8";
    
    if (currentTrack) {
        stopTrack();
    }
    
    isPlaying = false;
    document.getElementById('play-pause').src = './public/images/ui/play.png';
    updateSongList(mood);
});

/**
 * Obtiene el color correspondiente a un estado de ánimo
 * @param {string} mood - Estado de ánimo
 * @returns {string} Color en formato rgba o hex
 */
function getMoodColor(mood) {
    const moodColors = {
        "feliz": "rgba(247,255,109)",
        "triste": "rgba(66, 65, 65)",
        "energetico": "rgba(255,183,51)",
        "relajado": "rgba(167,188,224)",
        "inspirado": "rgba(255,196,205)",
        "estresado": "rgba(230, 73, 73)"
    };
    return moodColors[mood] || "#f0f4f8";
}

/**
 * Actualiza la interfaz del reproductor con la información de la canción
 * @param {Object} song - Objeto con los datos de la canción
 * @param {string} song.title - Título de la canción
 * @param {string} song.artist - Artista de la canción
 * @param {string} song.image - URL de la imagen de la canción
 */
function updatePlayerUI(song) {
    document.getElementById('song-title').textContent = song.title;
    document.getElementById('song-artist').textContent = song.artist;
    document.getElementById('song-image').src = song.image;
}

/**
 * Carga una nueva pista de audio
 * @param {number} index - Índice de la canción en el array songs
 */
function loadTrack(index) {
    if (currentTrack) currentTrack.stop();

    const song = songs[index];
    currentTrack = new Howl({
        src: [song.src],
        volume: songVolume,
        onend: nextTrack
    });
    updatePlayerUI(song);
    songIndex = index;
}

/**
 * Reproduce la pista actual
 * @description Inicia la reproducción y actualiza la UI
 */
function playTrack() {
    if (currentTrack) {
        currentTrack.play(); 
        isPlaying = true;
        document.getElementById('play-pause').src = './public/images/ui/pause.png';

        if (!analyser) {
            loadEqualizer();
        }
        animateEqualizer();
    }
}

/**
 * Pausa la reproducción de la pista actual
 */
function pauseTrack() {
    if (isPlaying) {
        currentTrack.pause();
        isPlaying = false;
        document.getElementById('play-pause').src = './public/images/ui/play.png';
    }
}

/**
 * Detiene completamente la reproducción
 * @description Detiene la reproducción y reinicia el estado del reproductor
 */
function stopTrack() {
    if (currentTrack) {
        currentTrack.stop();
        isPlaying = false;
        document.getElementById('play-pause').src = './public/images/ui/play.png';
        document.getElementById('seek-bar').value = 0;
        
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

/**
 * Reproduce la siguiente canción en la lista
 */
function nextTrack() {
    songIndex = (songIndex + 1) % songs.length;
    loadTrack(songIndex);
    playTrack();
}

/**
 * Reproduce la canción anterior en la lista
 */
function prevTrack() {
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadTrack(songIndex);
    playTrack();
}

/**
 * Ajusta el tamaño del canvas del ecualizador según el tamaño del contenedor
 */
function resizeEqualizer() {
    const container = document.getElementById('equalizer-container');
    const containerWidth = container.clientWidth;
    
    // Ajustar el ancho máximo del canvas
    canvas.width = Math.min(containerWidth - 20, 500);
    canvas.height = Math.min(canvas.width * 0.5, 250); 
}

// Llamar a resizeEqualizer cuando se carga la página y cuando se redimensiona la ventana
window.addEventListener('load', resizeEqualizer);
window.addEventListener('resize', resizeEqualizer);

/**
 * Inicializa el analizador de audio para el ecualizador
 * @description Configura el contexto de audio y el analizador para la visualización
 */
function loadEqualizer() {
    if (!Howler.ctx) {
        Howler.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (analyser) {
        analyser.disconnect();
    }

    analyser = Howler.ctx.createAnalyser();
    analyser.fftSize = 512;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    Howler.masterGain.disconnect();
    Howler.masterGain.connect(analyser);
    analyser.connect(Howler.ctx.destination);
}

/**
 * Anima el ecualizador visual
 * @description Dibuja las barras del ecualizador basadas en los datos de frecuencia
 */
function animateEqualizer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);
    let barWidth = (canvas.width / bufferLength) * 1;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let barHeight = dataArray[i + 5];
        ctx.fillStyle = `rgb(${barHeight + 100},50,150)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
    if (isPlaying) requestAnimationFrame(animateEqualizer);
}

/**
 * Configura los event listeners del reproductor
 * @description Inicializa todos los event listeners necesarios para el funcionamiento del reproductor
 */
function setupEventListeners() {
    document.getElementById('play-pause').addEventListener('click', () => {
        if (isPlaying) pauseTrack();
        else playTrack();
    });
    document.getElementById('prev').addEventListener('click', prevTrack);
    document.getElementById('next').addEventListener('click', nextTrack);
    document.getElementById('volume-control').addEventListener('input', (e) => {
        songVolume = e.target.value;
        if (currentTrack) currentTrack.volume(songVolume);
    });
    document.getElementById('seek-bar').addEventListener('input', (e) => {
        if (currentTrack) {
            const seekTime = currentTrack.duration() * (e.target.value / 100);
            currentTrack.seek(seekTime);
        }
    });
    setInterval(() => {
        if (currentTrack && currentTrack.playing()) {
            const seek = currentTrack.seek() || 0;
            document.getElementById('seek-bar').value = (seek / currentTrack.duration()) * 100;
        }
    }, 1000);
}

/**
 * Reinicia el reproductor a su estado inicial
 * @description Limpia el estado del reproductor y reinicia la UI
 */
function resetPlayer() {
    document.getElementById('song-title').textContent = 'Título';
    document.getElementById('song-artist').textContent = 'Artista';
    document.getElementById('song-image').src = './public/images/ui/default.png';
    document.getElementById('play-pause').src = './public/images/ui/play.png';
    document.getElementById('seek-bar').value = 0;
    
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    if (analyser) {
        analyser.disconnect();
    }
    
    currentTrack = null;
    isPlaying = false;
    songIndex = 0;
    analyser = null;
    bufferLength = null;
    dataArray = null;
}

setupEventListeners();