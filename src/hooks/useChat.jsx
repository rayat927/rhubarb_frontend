import { createContext, useContext, useEffect, useRef, useState } from "react";

// const backendWsUrl = "wss://bcade4a55f5c.ngrok-free.app/ws/chat/";
const backendWsUrl = "wss://www.englovoice.com/ws/chat/"
const ChatContext = createContext();

class AudioStreamManager {
  constructor() {
    this.audioCtx = null;

    // Playback state
    this.messageQueue = [];                 // FIFO of message_ids waiting to play
    this.activeMessageId = null;            // message_id currently playing
    this.chunkQueues = new Map();           // message_id -> Array<AudioBuffer>
    this.finalSeen = new Set();             // message_id where server sent is_final
    this.currentSource = null;              // currently scheduled/playing source
    this.scheduleCursor = 0;                // audioCtx time cursor
    this.playing = false;                   // whether a chunk is playing/scheduled
    this.interrupted = false;               // if we were told to stop immediately
  }

  ensureCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.scheduleCursor = this.audioCtx.currentTime;
    }
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();
  }

  async decodeBase64(b64) {
    this.ensureCtx();
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return await this.audioCtx.decodeAudioData(bytes.buffer);
  }

  // Called when server says: incoming new reply should cancel the old one
  interruptNow() {
    this.interrupted = true;
    this.stopCurrentSource();
    this.flushAll();
  }

  stopCurrentSource() {
    try { this.currentSource && this.currentSource.stop(0); } catch {}
    this.currentSource = null;
    this.playing = false;
  }

  flushAll() {
    this.messageQueue = [];
    this.activeMessageId = null;
    this.chunkQueues.clear();
    this.finalSeen.clear();
    this.scheduleCursor = this.audioCtx ? this.audioCtx.currentTime : 0;
  }

  // Ensure the message is known and queued (FIFO) if not active
  ensureMessageEnqueued(message_id) {
    if (!this.chunkQueues.has(message_id)) this.chunkQueues.set(message_id, []);
    if (this.activeMessageId === message_id) return;
    if (!this.messageQueue.includes(message_id) && this.activeMessageId !== message_id) {
      this.messageQueue.push(message_id);
    }
    this.maybeStartNext();
  }

  // Called for each incoming chunk
  async pushChunk(message_id, b64) {
    if (this.interrupted) return; // ignore after interrupt until next session
    this.ensureCtx();
    this.ensureMessageEnqueued(message_id);
    if (!b64) return;
    try {
      const buf = await this.decodeBase64(b64);
      const q = this.chunkQueues.get(message_id) || [];
      q.push(buf);
      this.chunkQueues.set(message_id, q);
      this.scheduleIfActive(message_id);
    } catch (e) {
      console.error("decode error", e);
    }
  }

  // Called when server sends is_final=true
  markFinal(message_id) {
    this.finalSeen.add(message_id);
    // If it's active and idle, we might be done → advance
    this.scheduleIfActive(message_id);
  }

  // Start next message if none active
  maybeStartNext() {
    if (this.interrupted) return;
    if (this.activeMessageId) return;
    const next = this.messageQueue.shift();
    if (!next) return;
    this.activeMessageId = next;
    // reset cursor at "now" for new message, but allow overlap-free scheduling
    this.scheduleCursor = this.audioCtx ? Math.max(this.scheduleCursor, this.audioCtx.currentTime) : 0;
    this.scheduleIfActive(next);
  }

  // Only schedule playback for active message
  scheduleIfActive(message_id) {
    if (this.interrupted) return;
    if (this.activeMessageId !== message_id) return;
    if (!this.audioCtx) return;

    // If not currently playing/scheduled, and we have a chunk → schedule it
    if (!this.playing) {
      const q = this.chunkQueues.get(message_id) || [];
      const nextBuf = q.shift();
      if (nextBuf) {
        const source = this.audioCtx.createBufferSource();
        source.buffer = nextBuf;
        source.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;
        const startAt = Math.max(this.scheduleCursor, now + 0.02); // tiny safety offset
        try { source.start(startAt); } catch (e) { console.warn("start err", e); }
        this.currentSource = source;
        this.playing = true;
        this.scheduleCursor = startAt + nextBuf.duration;

        source.onended = () => {
          this.playing = false;
          this.currentSource = null;
          // After a chunk finishes, try to schedule the next for same message
          this.scheduleIfActive(message_id);

          // If queue empty and finalSeen => message is done → advance to next
          const hasMore = (this.chunkQueues.get(message_id) || []).length > 0;
          if (!hasMore && this.finalSeen.has(message_id) && !this.playing) {
            // Clean up finished message
            this.chunkQueues.delete(message_id);
            this.finalSeen.delete(message_id);
            this.activeMessageId = null;
            this.maybeStartNext();
          }
        };
        return;
      }

      // No chunk to play now:
      // If final seen and queue empty -> finish this message & move on
      const hasMore = (this.chunkQueues.get(message_id) || []).length > 0;
      if (!hasMore && this.finalSeen.has(message_id)) {
        this.chunkQueues.delete(message_id);
        this.finalSeen.delete(message_id);
        this.activeMessageId = null;
        this.maybeStartNext();
      }
    }
  }
}


export const ChatProvider = ({ children }) => {
   const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const socketRef = useRef(null);

  // 🔑 one global manager instance
  const audioMgrRef = useRef(null);
  if (!audioMgrRef.current) audioMgrRef.current = new AudioStreamManager();

  const ensureAudioUnlocked = async () => {
    audioMgrRef.current.ensureCtx();
  };

  const chat = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      setLoading(true);
      socketRef.current.send(JSON.stringify({ type: "input", message: text }));
    }
  };

  const onMessagePlayed = () => setMessages((prev) => prev.slice(1));

  useEffect(() => {
    if (messages.length > 0) setMessage(messages[0]);
    else setMessage(null);
  }, [messages]);

  useEffect(() => {
    const socket = new WebSocket(backendWsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      socketRef.current.send(JSON.stringify({ type: "user_data", message: { username: "arnab" } }));
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      // 🔴 hard interrupt (server requested)
      if (data.type === "interrupt_playback") {
        audioMgrRef.current.interruptNow();
        return;
      }

      if (data.type === "audio_chunk") {
        const { message_id, audio, is_final } = data;
        if (is_final) {
          audioMgrRef.current.markFinal(message_id);
        } else if (audio) {
          await audioMgrRef.current.pushChunk(message_id, audio);
        }
        return;
      }

      if (data.type === "message_done" && data.message) {
        // Keep your structured message list for UI / lipsync, etc.
        setMessages((prev) => [...prev, data.message]);
        setLoading(false);
        return;
      }

      // Legacy paths supported:
      if (data.messages) {
        setMessages((prev) => [...prev, ...data.messages]);
        setLoading(false);
        return;
      }
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setLoading(false);
        return;
      }

      if (data.type === "error") {
        console.error("Server error:", data.error);
        setLoading(false);
      }
    };

    socket.onerror = (e) => console.error("WS error", e);
    socket.onclose = () => {};

    return () => {};
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
        unlockAudio: ensureAudioUnlocked, // call once on user gesture
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