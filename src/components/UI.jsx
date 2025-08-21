import { useRef } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const {
    chat,
    loading,
    cameraZoomed,
    setCameraZoomed,
    message,
    connected, // ✅ from ChatProvider
  } = useChat();

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message && connected) {
      chat(text);
      input.current.value = "";
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        {/* Responsive Header (Dashboard + Virtual Friend) */}
        <div className="absolute top-0 left-0 right-0 flex flex-col sm:flex-row justify-between gap-4 m-4">
          {/* Dashboard Box */}
          <div className="pointer-events-auto backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg sm:w-auto w-full">
            <h1 className="font-black text-xl">Dashboard</h1>
            <a
              href="https://www.englovoice.com/dashboard"
              className="pointer-events-auto flex items-center gap-2 mt-2"
            >
              <span className="fw-bold">&larr;</span> Go Back
            </a>
          </div>

          {/* Friend Box */}
          <div className="pointer-events-auto backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg sm:w-auto w-full text-center sm:text-right">
            <h1 className="font-black text-xl">My Virtual Friend</h1>
            <p>I am from EngloVoice</p>
          </div>
        </div>

        {/* Camera Zoom Button */}
        <div className="w-full flex flex-col items-end justify-center h-full gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Input & Send Button */}
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            disabled={!connected} // prevent typing before connection
          />
          <button
            disabled={!connected || loading || message}
            onClick={sendMessage}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              !connected || loading || message
                ? "cursor-not-allowed opacity-30"
                : ""
            }`}
          >
            {!connected ? "Connecting..." : loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
};