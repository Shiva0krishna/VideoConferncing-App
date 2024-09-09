import React, { useEffect, useCallback, useState, useMemo } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Messaging from "./Messaging";
import { useNavigate } from "react-router-dom";


const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const navigate = useNavigate();

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
  }, [constrains, remoteSocketId, socket]);

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


  const stopMediaStream = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }

    if (peer && peer.peer) {
      peer.peer.close();
    }

  }, [myStream]);


  const handleExitRoom = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }

    peer.peer.getSenders().forEach((sender) => {
      peer.peer.removeTrack(sender);
    });

    socket.emit("user:leave", { to: remoteSocketId });
    setRemoteSocketId(null);
    setRemoteStream(null);
    stopMediaStream();
    navigate("/"); 
    window.location.reload();
  }, [myStream, socket, remoteSocketId, stopMediaStream, navigate]);

  const handleUserLeft = useCallback(({ email, id }) => {
    console.log(`User with email ${email} and ID ${id} has left the room.`);
    setRemoteStream(null);
    setRemoteSocketId(null);
    stopMediaStream();
    navigate("/");
    window.location.reload();
  }, [navigate, stopMediaStream]);


  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("peer:stream:off", handleRemoteStreamOff);
    socket.on("user:left",handleUserLeft);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("peer:stream:off", handleRemoteStreamOff);
      socket.off("user:left",handleUserLeft);
      
    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal, handleRemoteStreamOff, handleUserLeft]);

  return (
    <div className="font-sans bg-white min-h-screen">
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-semibold dark:text-white">Room</span>
            <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
              <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
              Connected
            </span>
          </div>
          <div className="flex gap-5">
            <button
                className="text-white bg-green-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Record
              </button>
            {myStream && <button onClick={sendStreams} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700">Send Streams</button>}
            {remoteSocketId ? (
              <button
                onClick={handleCallUser}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Call
              </button>
            ) : (
              <p className="text-gray-500">Waiting for opponent to join...</p>
            )}
            <button onClick={handlestreamoff} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700">Turn the Stream Off</button>
            
            <button
              onClick={handleExitRoom}
              className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Exit Room
            </button>

          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row gap-4 p-4 mt-20">
        {remoteStream && (
          <div className="flex-1">
            <ReactPlayer
              playing
              muted
              height="100%"
              width="100%"
              url={remoteStream}
              className="w-full h-full"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col items-center">
            <div className="w-full md:w-1/2 mb-4">
              <Messaging />
            </div>
          {myStream && (
            <ReactPlayer
              playing
              muted
              height="150px"
              width="300px"
              url={myStream}
              className="w-full md:w-1/2"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
