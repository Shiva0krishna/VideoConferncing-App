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
      gap:"8%",
      backgroundColor:"rgb(17 24 39)",
    }}>
    <section class="bg-gray-50 dark:bg-gray-900" style={{width:"50%"}}>
  <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8" style={{padding:"11% 7%"}}>
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Join the Room
              </h1>
              <form onSubmit={handlesubmit} class="space-y-4 md:space-y-6" >
                  <div>
                      <label for="email" class="block mb-2 text-sm font-medium text-gray-1100 dark:text-white">Your email</label>
                      <input type="email" 
                 value={email}
                 onChange={(e)=>setEmail(e.target.value)}
                 placeholder="Enter Email" class="bg-gray-50 border border-gray-300 text-gray-1100 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                  </div>
                  <div>
                      <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Room Id </label>
                      <input type="password"  
                 value={room}
                 onChange={(e)=>setRoom(e.target.value)}
                   placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                  </div>
                  <button  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Enter the Room</button>
              </form>
          </div>
      </div>
  </div>
</section>
    <div style={{
      marginTop:"10%",
    }}>
      <img src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/authentication/illustration.svg" alt="illustration"></img>
    </div>
    </div>
  );
}

export default Lobby;