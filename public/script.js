const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');


import { io } from "https://cdn.socket.io/4.8.0/socket.io.esm.min.js";
const socket = io();

const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };


async function makeCall() {
    const peerConnection = new RTCPeerConnection(config);
    const remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;

    peerConnection.ontrack = event => {

        remoteStream.addTrack(event.track);
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };
 
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    localVideo.srcObject = localStream;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);

    socket.on('offer', async (data) => {
        console.log("offer")
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
    });
    
    socket.on('answer', async (data) => {
        console.log("answer")
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    });
    
    socket.on('ice-candidate', async (candidate) => {
        if (candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    });
}


// script.js
document.addEventListener("DOMContentLoaded", () => {
    const sendButton = document.getElementById("sendButton");
    const messageInput = document.getElementById("messageInput");
    const chatArea = document.getElementById("chatArea");
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    // Функция для отправки сообщения
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message === "") {
            alert("Message cannot be empty!");
            return;
        }
        chatArea.value += `You: ${message}\n`;
        chatArea.scrollTop = chatArea.scrollHeight;
        messageInput.value = "";
    }

    // Обработка клика по кнопке "Send"
    sendButton.addEventListener("click", sendMessage);

    // Отправка сообщения по нажатию Enter
    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    // Переключение темы
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-theme");
        if (body.classList.contains("dark-theme")) {
            themeToggle.textContent = "Switch to Light Theme";
        } else {
            themeToggle.textContent = "Switch to Dark Theme";
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const attachButton = document.getElementById("attachButton");

    attachButton.addEventListener("click", () => {
        alert("Attach functionality is not implemented yet.");
    });
});


makeCall();
