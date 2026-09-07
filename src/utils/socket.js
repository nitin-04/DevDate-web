import { io } from "socket.io-client";
import { BASE_URL } from "./constants";

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(BASE_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  } else if (socketInstance.disconnected) {
    socketInstance.connect();
  }
  return socketInstance;
};

export const createSocketConnection = getSocket;
