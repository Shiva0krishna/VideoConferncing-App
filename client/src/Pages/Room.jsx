import React, { useEffect, useCallback, useState,useMemo } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const constrains = useMemo(() => ({
    audio: true,
    video: true,
  }), []);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia(constrains);
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [constrains,remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia(constrains);
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [constrains, socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async({ from, ans }) => {
      await peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handlestreamoff = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
      peer.peer.getSenders().forEach((sender) => {
        peer.peer.removeTrack(sender);
      });
      socket.emit("peer:stream:off", { to: remoteSocketId });
      console.log("Stream turned off");
    }
  }, [myStream, remoteSocketId, socket]);

  const handleRemoteStreamOff = useCallback(() => {
    console.log("Remote stream turned off");
    setRemoteStream(null);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("peer:stream:off", handleRemoteStreamOff);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("peer:stream:off", handleRemoteStreamOff);

    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal, handleRemoteStreamOff]);

  return (
    <div  style={{fontFamily:"sans-serif"}}>
      <span style={{display:"flex",padding:"0px 10px",justifyContent:"space-between",flexDirection:"row",background:"dodgerblue"}}>
        <div style={{justifyContent:"flex-start"}}>
        <h1 style={{display:"inline-block",marginRight:"15px"}}>Room Page   </h1>
        <h4 style={{fontSize:"24px",display:"inline-block"}}>{remoteSocketId ? "Connected" : "No one in room"}</h4>
        </div>
        <div style={{justifyContent:"right"}}>
        {myStream && <button style={{padding:"0px 18px",height:"45px",marginTop:"15px",fontSize:"19px",border:"0px"}} onClick={sendStreams}>Send Stream</button>}
        {remoteSocketId && <button style={{padding:"0px 18px",marginLeft:"15px",height:"45px",marginTop:"15px",fontSize:"19px",border:"0px"}} onClick={handleCallUser}>CALL</button>}
        <button style={{padding:"0px 18px",height:"45px",marginLeft:"15px",marginTop:"10px",fontSize:"19px",border:"0px"}} onClick={handlestreamoff}>Turn the stream off</button>
        </div>
      </span>
      <span style={{display:"flex",flexDirection:"row"}}>
        {remoteStream && (
          <>
            <ReactPlayer
              playing
              muted
              height="600px"
              width="900px"
              url={remoteStream}
            />
          </>
        )}
        <span>
          <div style={{height:"450px"}}>Chat Here</div>
        {myStream && (
          <>
            <ReactPlayer
              playing
              muted
              height="150px"
              width="300px"
              url={myStream}
            />
          </>
        )}
        </span>
      </span>
    </div>
  );
};

export default RoomPage;
