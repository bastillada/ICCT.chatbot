import { useState } from "react";
import AiChatBotIcon from "./AiChatBotIcon";

const ChatMessage = ({ chat }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const imageUrlRegex =
    /(https?:\/\/[^\s)]+?\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s)]*)?)/i;

  const imageMatch =
    typeof chat.text === "string"
      ? chat.text.match(imageUrlRegex)
      : null;

  const imageUrl = imageMatch ? imageMatch[0] : null;

  const cleanText = imageUrl
    ? chat.text.replace(imageUrl, "").replace("[View Image]()", "").trim()
    : chat.text || "";

  return (
    <>
      <div
        className={`message ${
          chat.role === "model" ? "bot" : "user"
        }-message`}
      >
        {chat.role === "model" && <AiChatBotIcon />}

        <div className="message-text">
          <p>{cleanText}</p>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="announcement"
              onClick={() => setSelectedImage(imageUrl)}
              style={{
                maxWidth: "100%",
                maxHeight: "220px",
                marginTop: "10px",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            />
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="image-modal"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="full" />
        </div>
      )}
    </>
  );
};

export default ChatMessage;
