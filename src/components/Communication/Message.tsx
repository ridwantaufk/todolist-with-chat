interface MessageProps {
  text: string;
  sender: "user" | "bot";
}

const Message = ({ text, sender }: MessageProps) => {
  return (
    <div
      className={`flex ${sender === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`p-2 rounded-lg max-w-xs text-sm
          ${
            sender === "user"
              ? "bg-blue-500 text-white self-end"
              : "bg-gray-300 text-black self-start"
          }`}
      >
        {text}
      </div>
    </div>
  );
};

export default Message;
