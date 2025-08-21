import { createContext, useContext, useEffect, useRef, useState } from "react";

const backendWsUrl = "wss://www.englovoice.com/ws/chat/";
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [connected, setConnected] = useState(false); // ✅ track WebSocket state

  const socketRef = useRef(null);

  // Send a message through WebSocket
  const chat = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      setLoading(true);
      socketRef.current.send(JSON.stringify({ type: "input", message: text }));
    }
  };

  const onMessagePlayed = () => {
    setMessages((prev) => prev.slice(1));
  };

  // Handle first message display
  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  // WebSocket connection setup
  useEffect(() => {
    const socket = new WebSocket(backendWsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true); // ✅ mark connected
      socketRef.current.send(
        JSON.stringify({ type: "user_data", message: { username: "arnab" } })
      );
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.messages) {
          setMessages((prev) => [...prev, ...data.messages]);
        } else if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error("Invalid JSON from WebSocket:", err);
      }
      setLoading(false);
    };

    socket.onerror = () => {
      setConnected(false);
    };

    socket.onclose = () => {
      setConnected(false); // 🔴 mark disconnected
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        connected, // ✅ provided in context
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};