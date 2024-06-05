class PeerService {
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            'stun:stun.l.google.com:19302',
                            'stun:global.stun.twilio.com:3478'
                        ],
                    },
                ],
            });

            this.peer.onicecandidate = event => {
                if (event.candidate) {
                    // Send the candidate to the remote peer
                    console.log('ICE Candidate:', event.candidate);
                }
            };

            this.peer.onconnectionstatechange = () => {
                console.log('Connection state:', this.peer.connectionState);
            };

            this.peer.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', this.peer.iceConnectionState);
            };

            this.dataChannel = null;
            this.messageQueue = [];
            console.log(this.messageQueue);
        }
    }

    async getAnswer(offer) {
        if (this.peer && offer) {
            try {
                await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await this.peer.createAnswer();
                await this.peer.setLocalDescription(answer);
                return answer;
            } catch (error) {
                console.error('Error in getAnswer:', error);
            }
        } else {
            console.error('Invalid offer:', offer);
        }
    }

    async setLocalDescription(description) {
        if (this.peer && description) {
            try {
                await this.peer.setRemoteDescription(new RTCSessionDescription(description));
            } catch (error) {
                console.error('Error in setLocalDescription:', error);
            }
        } else {
            console.error('Invalid description:', description);
        }
    }

    async getOffer() {
        if (this.peer) {
            try {
                const offer = await this.peer.createOffer();
                await this.peer.setLocalDescription(offer);
                return offer;
            } catch (error) {
                console.error('Error in getOffer:', error);
            }
        }
    }

    sendData(message) {
        if (this.peer) {
            if (!this.dataChannel) {
                this.dataChannel = this.peer.createDataChannel('myDataChannel');
                this.setupDataChannel(this.dataChannel);
            }
            if (this.dataChannel.readyState === 'open') {
                this.dataChannel.send(message);
            } else {
                this.messageQueue.push(message);
                this.dataChannel.onopen = () => {
                    this.messageQueue.forEach(msg => this.dataChannel.send(msg));
                    this.messageQueue = [];
                };
            }
        }
    }

    listenChannel() {
        if (this.peer) {
            this.peer.ondatachannel = event => {
                const dataChannel = event.channel;
                this.setupDataChannel(dataChannel);
            };
        }
    }

    setupDataChannel(dataChannel) {
        dataChannel.onopen = () => {
            console.log('Data channel is open');
            this.messageQueue.forEach(msg => dataChannel.send(msg));
            this.messageQueue = [];
        };

        dataChannel.onclose = () => {
            console.log('Data channel is closed');
        };

        dataChannel.onmessage = event => {
            console.log('Message from data channel:', event.data);
        };

        dataChannel.onerror = error => {
            console.error('Data channel error:', error);
        };
    }
}

const peerService = new PeerService();
export default peerService;
