import { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate} from "react-router-dom";

function Lobby() {
  const [email,setEmail]= useState("");
  const [room, setRoom]= useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  const handlesubmit =useCallback(
    (e)=>{
      e.preventDefault();
      socket.emit('room:join',{email,room});
    },
    [email,room,socket]
  );

  const handleJoinRoom = useCallback((data)=>{
    const {email, room}= data;
    console.log(email,room);
    navigate(`/room/${room}`)
  },[navigate])

  useEffect(()=>{
    socket.on("room:join",handleJoinRoom);
    return ()=>{
      socket.off('room:join',handleJoinRoom);
    }
  },[socket,handleJoinRoom])

  return (
    <div style={{display:"flex",
      flexDirection:"row",
      gap:"8%"
    }}>
    <div style={{
      fontFamily:"sans-serif",
      width:"50%",
      height:"95vh",
      background:"#269"}}>
      <div style={{paddingTop:"20%",paddingLeft:"30%"}}>
        <h1 style={{fontFamily:"revert-layer",fontSmooth:"10px"}}>Lobby</h1>
        <form onSubmit={handlesubmit}>
          <label htmlFor="email" style={{fontSize:"23px",fontWeight:"500px"}}> Email </label><br/>
          <input id="email" 
                 type="email" 
                 value={email}
                 onChange={(e)=>setEmail(e.target.value)}
                 placeholder="Enter Email"
                 style={{padding:"9px 18px",marginTop:"10px",fontSize:"19px",border:"0px"}}></input>
          <br/><br/>
          <label htmlFor="room" style={{fontSize:"23px",fontWeight:"500px"}}> Room no</label><br/>
          <input id="room"
                 value={room}
                 onChange={(e)=>setRoom(e.target.value)}
                 type="text"
                 placeholder="Enter Room No"
                 style={{padding:"9px 18px",marginTop:"10px",fontSize:"19px",border:"0px"}}></input>
          <br/>
          <button 
          style={{padding:"9px 18px",marginTop:"10px",fontSize:"19px",border:"0px"}}>Join</button>
        </form>
      </div>
    </div>
    <div style={{
      fontSize:"30px",
      fontFamily:"sans-serif",
      color:"dodgerblue",
      fontWeight:"1000px",
      padding:"10% 0",
      width:"40%"
    }}>A Peer to Peer Connection video Conferncing<br/> Application establishing effective and scalable connection between users uisng socket <br/> and WebRTC  </div>
    </div>
  );
}

export default Lobby;