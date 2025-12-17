document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('stream-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const statusMessage = document.getElementById('status-message');
    // Ganti dengan URL actual Icecast/Shoutcast
    const streamUrl = 'https://stream.zeno.fm/kzizu3f1dlatv.mp3'; 
    
    let isPlaying = true; // Karena kita set 'autoplay' di HTML

    // Fungsi untuk mengontrol tombol Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            player.pause();
            playPauseBtn.innerHTML = '▶️ Putar';
            statusMessage.textContent = 'Streaming Dijeda';
        } else {
            player.load(); // Memuat ulang stream jika berhenti total
            player.play().then(() => {
                playPauseBtn.innerHTML = '⏸️ Jeda';
                statusMessage.textContent = 'Sedang Streaming...';
            }).catch(error => {
                console.error("Gagal Memutar:", error);
                statusMessage.textContent = 'Gagal Memutar Stream. Coba Lagi.';
            });
        }
        isPlaying = !isPlaying;
    });

    // Opsional: Fungsi untuk mengambil data "Now Playing" dari Icecast/Shoutcast
    function getNowPlaying() {
        // Icecast menyediakan API status, misal: http://[IP]:8000/status-json.xsl
        // Anda perlu menggunakan Fetch API di sini.
        fetch(`https://stream.zeno.fm/kzizu3f1dlatv/status-json.xsl`) 
            .then(response => response.json())
            .then(data => {
                const songTitle = data.icestats.source[0].title;
                document.getElementById('song-info').textContent = songTitle || "Informasi lagu tidak tersedia.";
            })
            .catch(error => {
                console.warn("Gagal mengambil info lagu.");
                document.getElementById('song-info').textContent = "Server info tidak merespon.";
            });
    }

    // Panggil fungsi pengambilan info lagu secara berkala (setiap 10 detik)
    setInterval(getNowPlaying, 10000); 
    getNowPlaying(); // Panggil sekali saat dimuat
});