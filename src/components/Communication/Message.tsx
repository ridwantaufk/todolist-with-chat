interface User {
  id: string;
  name: string;
  role: string;
}

interface MessageProps {
  user: User | null;
  senderId: string;
  receiverId: string;
  text: string;
}

const Message = ({ user, senderId, receiverId, text }: MessageProps) => {
  const currentUserId = user?.id;
  const isSender = senderId === currentUserId;
  const isReceiver = receiverId === currentUserId;
  // console.log(
  //   "user, senderId, receiverId, text : ",
  //   user,
  //   senderId,
  //   receiverId,
  //   text
  // );
  // console.log("currentUserId = user?.id : ", currentUserId == senderId);

  return (
    <div className="flex flex-col space-y-1">
      {/* pengirim */}
      {isSender && (
        <div className="flex justify-end">
          <div className="p-2 max-w-xs text-sm bg-blue-500 text-white rounded-lg">
            {text}
          </div>
        </div>
      )}
      {/* penerima */}
      {isReceiver && (
        <div className="flex justify-start">
          <div className="p-2 max-w-xs text-sm bg-purple-700 text-white rounded-lg">
            {text}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
