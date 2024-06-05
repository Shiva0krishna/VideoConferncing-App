import React, { useState, useEffect, useCallback } from 'react';
import peer from '../service/peer';
import '../App.css'
export default function Messaging() {
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        peer.listenChannel();
        peer.peer.ondatachannel = event => {
            const dataChannel = event.channel;
            dataChannel.onmessage = event => {
                setMessages(prevMessages => [...prevMessages, { sender: 'remote', text: event.data }]);
            };
        };
    }, []);

    const handleSendDataStream = useCallback((e) => {
        e.preventDefault();
        if (msg.trim()) {
            peer.sendData(msg);
            setMessages(prevMessages => [...prevMessages, { sender: 'local', text: msg }]);
            setMsg('');
        }
    }, [msg]);

    return (
        <div>
            <h1>WebRTC Messaging</h1>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        <span>{msg.sender === 'local' ? 'You' : 'Opponent'}: {msg.text}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendDataStream}>
                <label htmlFor='data'>Chat</label>
                <input
                    id="data"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    type="text"
                    placeholder="Message"
                    style={{ padding: "9px 18px", marginTop: "10px", fontSize: "19px", border: "0px" }}
                />
                <button type="button" className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Dark</button>

            </form>
        </div>
    );
}
