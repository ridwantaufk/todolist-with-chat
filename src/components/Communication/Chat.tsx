import React, { useState, useEffect, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { FaCommentAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import Message from "./Message";
import { v4 as uuidv4 } from "uuid";
import { EventSourcePolyfill } from "event-source-polyfill";

interface User {
  id: string;
  name: string;
  role: string;
}

interface Receiver {
  id: string;
  name: string;
  role: string;
}

interface Message {
  id?: string | number;
  text: string;
  receiverId: string;
  senderId: string;
}

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [receiver, setReceiver] = useState<Receiver | null>(null);
  const [hovered, setHovered] = useState(false);
  const [visibleUsers, setVisibleUsers] = useState<number[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let timeouts = [];

    if (hovered) {
      setVisibleUsers([]);
      users.forEach((_, index) => {
        timeouts.push(
          setTimeout(() => {
            setVisibleUsers((prev) => [...prev, index]);
          }, index * 20)
        );
      });
    } else {
      const visibleUsersCopy = [...visibleUsers];
      visibleUsersCopy.reverse().forEach((index, i) => {
        timeouts.push(
          setTimeout(() => {
            setVisibleUsers((prev) =>
              prev.filter((userIndex) => userIndex !== index)
            );
          }, i * 20)
        );
      });
    }

    return () => timeouts.forEach(clearTimeout);
  }, [hovered, users]);

  useEffect(() => {
    if (!receiver) return;

    const eventSource = new EventSource(`/api/chats?receiverId=${receiver.id}`);

    eventSource.onmessage = (event) => {
      // console.log("SSE Data Received:", event.data);
      const newMessages = JSON.parse(event.data);
      setMessages(newMessages);
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
      setTimeout(
        () => new EventSource(`/api/chats?receiverId=${receiver.id}`),
        3000
      );
    };

    return () => eventSource.close();
  }, [receiver]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil data pengguna");

      const userData = await response.json();
      setUsers(userData.users);
      setUser(userData.userName);
      // console.log("userData.users : ", userData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const sendMessage = async () => {
    // console.log("inputan : ", !input.trim());
    // return;
    if (!input.trim()) return;
    // console.log("receiver : ", receiver);
    const newMessage = {
      id: uuidv4(),
      text: input,
      receiverId: receiver.id,
      senderId: user.id,
    };
    // setMessages([]);
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newMessage.text,
          receiverId: newMessage.receiverId,
          senderId: user.id,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Gagal mengirim pesan");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="relative flex flex-col h-96 w-80 bg-gray-100 rounded-lg shadow-lg p-4">
      <div
        className={`absolute rounded-full flex flex-col items-center justify-center transition-all duration-300`}
        style={{
          top: "9%",
          left: "10%",
          padding: hovered ? "80%" : "0",
          transform: `translate(-50%, -50%) scale(${hovered ? 1.1 : 1})`,
        }}
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
      >
        <FaUsers size={30} className="text-blue-500 cursor-pointer" />

        {users.map((user, index) => {
          const totalUsers = users.length;
          const startAngle = (105 * Math.PI) / 180;
          const endAngle = (330 * Math.PI) / 180;
          const angleStep =
            (endAngle - startAngle) / Math.max(totalUsers - 1, 1);

          const baseRadius = 50;
          const spacingFactor = 12;
          const radius = baseRadius + totalUsers * spacingFactor;

          const angle = startAngle + index * angleStep;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <div
              key={user.id}
              className={`absolute flex flex-col items-center transition-opacity ease-in-out ${
                visibleUsers.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 hidden"
              }`}
              onClick={() =>
                setReceiver({ id: user.id, name: user.name, role: user.role })
              }
              style={{
                transform: `translate(${x}px, ${y}px)`,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            >
              <FaUser size={20} className="text-blue-500" />
              <span className="bg-gray-800 text-white text-xs w-max rounded py-1 px-2 mt-1">
                {user.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className=" absolute top-5 left-20 text-gray-700 font-bold">
        {receiver ? receiver.name + " - " + receiver.role : ""}
      </div>

      <div className="mt-12 border p-2 rounded-lg flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            user={user}
            senderId={msg.senderId}
            receiverId={msg.receiverId}
            text={msg.text}
          />
        ))}
        <div ref={messagesEndRef} />
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
