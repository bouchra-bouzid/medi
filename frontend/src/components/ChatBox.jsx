import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import "./ChatBox.css";

const ChatBox = ({ currentUser, receiver, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  // Charger la conversation
  useEffect(() => {
  if (!receiver) return;

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/conversation/${currentUser._id}/${receiver._id}`);
      setMessages(res.data); // toujours remplacer la liste pour rester synchro
    } catch (err) {
      console.error("Erreur fetch messages :", err);
    }
  };

  fetchMessages(); // fetch initial
  const interval = setInterval(fetchMessages, 2000); // mise à jour continue toutes les 2s

  return () => clearInterval(interval);
}, [currentUser, receiver]);


  // Envoyer un message
  const sendMessage = async (e) => {
  e.preventDefault();
  if (!newMsg.trim()) return;
  try {
    const res = await API.post("/messages", {
      senderId: currentUser._id,
      senderName: currentUser.name,
      receiverId: receiver._id,
      text: newMsg,
    });
    setMessages((prev) => [...prev, res.data]);
    setNewMsg("");

    // ✅ avertit le parent d’ajouter le médecin si nouveau
    if (onMessageSent) onMessageSent(receiver);
  } catch (err) {
    console.error("Erreur envoi :", err);
  }
};


  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
      <div className="chatbox-header" onClick={onClose}>
        💬 {receiver ? receiver.name : "Messagerie"} <span>✖</span>
      </div>

      {!receiver ? (
        <p className="no-chat">Sélectionnez un utilisateur pour discuter.</p>
      ) : (
        <>
          <div className="chatbox-messages">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`message-bubble ${
                  msg.senderId === currentUser._id ? "sent" : "received"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chatbox-input">
            <input
              type="text"
              placeholder="Écrire un message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
            />
            <button type="submit">Envoyer</button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;
