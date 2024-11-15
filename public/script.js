const localVideo = document.getElementById('localVideo');

import { io } from "https://cdn.socket.io/4.8.0/socket.io.esm.min.js";
const socket = io();

const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const container = document.getElementById("video-container")

async function makeCall() {
    const peerConnection = new RTCPeerConnection(config);
    

    peerConnection.ontrack = event => {
        const video = document.createElement("video");
        video.autoplay = true
        container.appendChild(video)
        
        const remoteStream = new MediaStream();
        remoteVideo.srcObject = remoteStream;
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

makeCall();
