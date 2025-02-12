import React, { useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { FaCommentAlt } from "react-icons/fa";
import Message from "./Message";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    setTimeout(() => {
      const botReply: Message = {
        id: Date.now() + 1,
        text: "Halo! Saya bot, bagaimana saya bisa membantu?",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-96 w-80 bg-gray-100 rounded-lg shadow-lg p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <Message key={msg.id} text={msg.text} sender={msg.sender} />
        ))}
      </div>
      <div className="flex items-center border-t mt-2 pt-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded-md text-black bg-white"
          placeholder="Ketik pesan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={sendMessage}
        >
          <AiOutlineSend size={20} />
        </button>
      </div>
    </div>
  );
};

const ChatFeature = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  return (
    <div className="fixed bottom-10 right-10 z-50">
      <button
        onClick={() => setIsChatVisible((prev) => !prev)}
        className="bg-blue-600 text-white rounded-full p-3 shadow-lg transition-transform duration-300 hover:scale-105"
      >
        <FaCommentAlt size={24} />
      </button>

      {isChatVisible && (
        <div className="mt-2">
          <Chat />
        </div>
      )}
    </div>
  );
};

export default ChatFeature;
