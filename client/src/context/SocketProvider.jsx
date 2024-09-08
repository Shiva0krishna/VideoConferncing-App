import { createContext, useContext, useMemo } from "react";
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export default function SocketProvider(props) {
  const socket = useMemo(() => io('https://videoconferncing-app.onrender.com', {
    //https://videoconferncing-app.onrender.com
    path: '/socket.io', 
    transports: ['websocket'],
    secure: true
  }), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
}