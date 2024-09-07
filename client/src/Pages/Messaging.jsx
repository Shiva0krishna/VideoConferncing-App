import React, { useState, useEffect, useCallback } from 'react';
import peer from '../service/peer';
import '../App.css'; // Import the CSS file

export default function Messaging() {
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([]);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        peer.listenChannel();
        peer.peer.ondatachannel = event => {
            const dataChannel = event.channel;
            dataChannel.onmessage = event => {
                setMessages(prevMessages => [...prevMessages, { sender: 'remote', text: event.data }]);
            };
        };
    }, []);

    useEffect(() => {
        setDate(new Date());
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
        <div className="messaging-container">
            <h1 className="chat-title">Chat</h1>
            <div className="chat-box">
                <div className="message-container">
                    <h4 className="chat-date">{date.toDateString()}</h4>
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender === 'local' ? 'local-message' : 'remote-message'}`}>
                            <span>{msg.sender === 'local' ? 'You' : 'Opponent'}: {msg.text}</span>
                        </div>
                    ))}
                </div>
            </div>
            <form className="chat-form" onSubmit={handleSendDataStream}>
                <input
                    id="data"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    type="text"
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <button type="submit" className="send-button">Send</button>
            </form>
        </div>
    );
}
