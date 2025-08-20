import { createContext, useContext, useEffect, useRef, useState } from "react";

// const backendWsUrl = "wss://bcade4a55f5c.ngrok-free.app/ws/chat/";
const backendWsUrl = "wss://www.englovoice.com/ws/chat/"
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const socketRef = useRef(null);

  // Send a message through WebSocket
  const chat = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // console.log("Sending message to server:", text);
      setLoading(true);
      socketRef.current.send(JSON.stringify({ type: "input", message: text }));
    } else {
      // console.warn("WebSocket not ready. Could not send:", text);
    }
  };

  const onMessagePlayed = () => {
    // console.log("Message played & removed:", messages[0]);
    setMessages((prev) => prev.slice(1));
  };

  // Handle first message display
  useEffect(() => {
    if (messages.length > 0) {
      // console.log("Setting current message:", messages[0]);
      setMessage(messages[0]);
    } else {
      // console.log("No messages available, setting message = null");
      setMessage(null);
    }
  }, [messages]);

  // WebSocket connection setup
  useEffect(() => {
    // console.log("Connecting to WebSocket:", backendWsUrl);
    const socket = new WebSocket(backendWsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      // socketRef.current.send(JSON.stringify({ type: "user_data", message: {username: "arnab"} }));
      // console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      // console.log("📩 Raw message received from server:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.messages) {
          // console.log("Adding multiple messages:", data.messages);
          setMessages((prev) => [...prev, ...data.messages]);
        } else if (data.message) {
          // console.log("Adding single message:", data.message);
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (err) {
        // console.error("❌ Invalid JSON from WebSocket:", err);
      }
      setLoading(false);
    };

    socket.onerror = (error) => {
      // console.error("⚠️ WebSocket error:", error);
    };

    socket.onclose = () => {
      // console.log("❌ WebSocket closed");
    };

    return () => {
      // console.log("Cleaning up WebSocket connection...");
      // socket.close(); // Uncomment if you want to close on unmount
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