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

    async setLocalDescription(ans) {
        if (this.peer && ans) {
            try {
                await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            } catch (error) {
                console.error('Error in setLocalDescription:', error);
            }
        } else {
            console.error('Invalid answer:', ans);
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
}

const peerService = new PeerService();
export default peerService;
