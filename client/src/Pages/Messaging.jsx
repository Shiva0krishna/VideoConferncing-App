import React, { useState, useEffect, useCallback } from 'react';
import peer from '../service/peer';
import '../App.css'
export default function Messaging() {
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([]);
    const [date,setdate] =useState(new Date());

    useEffect(() => {
        peer.listenChannel();
        peer.peer.ondatachannel = event => {
            const dataChannel = event.channel;
            dataChannel.onmessage = event => {
                setMessages(prevMessages => [...prevMessages, { sender: 'remote', text: event.data }]);
            };
        };
    }, []);
    useEffect(()=>{
        setdate(new Date());
    },[])

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
            <h1 style={{fontFamily:"sans-serif",fontSize:"22px",color:"dodgerblue",fontWeight:"500"}}>Chat </h1>
            <div className="chat-box">
                <div style={{height:"87%",borderBottomColor:"2px dodgerblue"}}>
                <h4  style={{color:"black",textAlign:"center"}}>{date.toDateString()}</h4>
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        <span>{msg.sender === 'local' ? 'You ' : ' Opponent '}: {msg.text}</span><br/>
                    </div>
                ))}
                </div>
                </div>
                <form style={{backgroundColor:"smokewhite"}}  onSubmit={handleSendDataStream}>
                <input
                    id="data"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    type="text"
                    placeholder="Message"
                    class="bg-[#222630] px-4 py-3 mr-5 outline-none w-[280px] text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                    style={{ padding: "9px 18px", fontSize: "19px" }}
                />
                <button  class="text-gray-900   focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700  ">Send </button>
            </form>
        </div>
    );
}
