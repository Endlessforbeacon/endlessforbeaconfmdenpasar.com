// 1. Konfigurasi Firebase (Ganti dengan konfigurasi dari Firebase Console Anda)
const firebaseConfig = {
    apiKey: "AIzaSyAH0mZBidgAJ8xuN4KbBfIRUtZ-rfDpuOY",
    authDomain: "endless-for-beacon-fm-denpasar.firebaseapp.com",
    projectId: "endless-for-beacon-fm-denpasar",
    storageBucket: "endless-for-beacon-fm-denpasar.firebasestorage.app",
    messagingSenderId: "662375569061",
    appId: "1:662375569061:web:906529673af4b60a0a5f4c"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const chatRef = database.ref("live_chat");

// State User Logged In
let currentUser = null;

// DOM Elements
const authBtn = document.getElementById("auth-btn");
const loginModal = document.getElementById("login-modal");
const closeModal = document.getElementById("close-modal");
const userInfo = document.getElementById("user-info");
const userAvatar = document.getElementById("user-avatar");
const userDisplay = document.getElementById("user-display");

const playPauseBtn = document.getElementById("play-pause-btn");
const playIcon = document.getElementById("play-icon");
const audioPlayer = document.getElementById("audio-player");
const volumeSlider = document.getElementById("volume-slider");
const spinArt = document.querySelector(".spin-art");

const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

/* --- LOGIC MODAL & AUTHENTICATION --- */
authBtn.addEventListener("click", () => {
    if (currentUser) {
        // Logout jika user sudah login
        currentUser = null;
        userInfo.style.display = "none";
        authBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login`;
    } else {
        loginModal.style.display = "flex";
    }
});

closeModal.addEventListener("click", () => {
    loginModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === loginModal) loginModal.style.display = "none";
});

// Callback dari Google Sign-In SDK
function handleCredentialResponse(response) {
    // Decode Token JWT dari Google
    const responsePayload = parseJwt(response.credential);

    currentUser = {
        name: responsePayload.name,
        picture: responsePayload.picture,
        email: responsePayload.email
    };

    // Update UI Header
    userAvatar.src = currentUser.picture;
    userAvatar.style.display = "block";
    userDisplay.textContent = currentUser.name;
    userInfo.style.display = "flex";
    authBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;

    loginModal.style.display = "none";
}

// Helper Decode JWT
function parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

/* --- LOGIC LIVE CHAT REALTIME (24 JAM) --- */
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = chatInput.value.trim();

    if (!currentUser) {
        alert("Silakan Login terlebih dahulu untuk mengirim pesan.");
        loginModal.style.display = "flex";
        return;
    }

    if (messageText !== "") {
        // Kirim data ke Firebase Realtime Database
        chatRef.push({
            sender: currentUser.name,
            avatar: currentUser.picture,
            text: messageText,
            timestamp: Date.now()
        });

        chatInput.value = "";
    }
});

// Listener: Membaca Pesan Baru yang Masuk Secara Realtime Dari Seluruh Pengguna
chatRef.limitToLast(50).on("child_added", (snapshot) => {
    const data = snapshot.val();
    displayMessage(data);
});

function displayMessage(data) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");

    const time = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    msgDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <img src="${data.avatar}" style="width: 20px; height: 20px; border-radius: 50%;">
            <strong style="color: #38bdf8; font-size: 0.8rem;">${data.sender}</strong>
            <span style="font-size: 0.7rem; color: #94a3b8; margin-left: auto;">${time}</span>
        </div>
        <div>${escapeHtml(data.text)}</div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll ke paling bawah
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* --- LOGIC AUDIO PLAYER --- */
playPauseBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playIcon.className = "fa-solid fa-pause";
        spinArt.classList.add("playing");
    } else {
        audioPlayer.pause();
        playIcon.className = "fa-solid fa-play";
        spinArt.classList.remove("playing");
    }
});

volumeSlider.addEventListener("input", (e) => {
    audioPlayer.volume = e.target.value;
});