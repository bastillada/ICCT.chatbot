import ICCTlogo from "./assets/ICCTlogo.png";
import { useState, useRef, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import AiChatBotIcon from "./components/AiChatBotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./components/ChatMessage";
import About from "./about";
import systemPrompt from "./prompt";

import puter from "@heyputer/puter.js";
import "./index.css";

// ===== Home Page =====
const Home = () => (
  <>
    <div className="hero-section">
      <h1>Welcome to AI Chatbot</h1>

      <div className="hero-line"></div>

      <p>
        Click the chat icon below to start talking
        with the AI!
      </p>
    </div>

    <div className="content-layout">
      <div className="left-section">
        <div className="feature-card">
          <h3>ICCT Vision</h3>

          <div className="card-line"></div>

          <p>
            To become the leading premier provider
            of higher education in Asia.
          </p>
        </div>

        <div className="feature-card">
          <h3>ICCT Mission</h3>

          <div className="card-line"></div>

          <p>
            To prepare students for the manifold
            demands of technological efficiency
            needed in the fields of Information and
            Communication Technology, Health
            Sciences, and various disciplines
            through research, advanced studies,
            and international linkages while
            developing value-based individuals.
          </p>
        </div>
      </div>
    </div>
  </>
);

const AppContent = () => {
  const [showAichat, setShowAichat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageLeaving, setPageLeaving] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const chatBodyRef = useRef(null);

  // Scroll chat to bottom on update
  useEffect(() => {
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  // ===== LOAD ANNOUNCEMENTS FROM BACKEND =====
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const res = await fetch("http://localhost:3001/announcements");
        const data = await res.json();

        // Backend may return either an array or { announcements: [...] }
        const list = Array.isArray(data) ? data : data?.announcements || [];

        setAnnouncements(list);

        console.log("Announcements loaded:", list);
      } catch (error) {
        console.log("Announcement error:", error);
      }
    };

    loadAnnouncements();

    const interval = setInterval(loadAnnouncements, 60000);

    return () => clearInterval(interval);
  }, []);

  // Internal page leave animation
  const playPageLeave = () => {
    setPageLeaving(true);

    setTimeout(() => {
      setPageLeaving(false);
      setMenuOpen(false);
    }, 500);
  };

  // ===== AI RESPONSE =====
  const generateBotResponse = async (updatedHistory) => {
    if (!updatedHistory.length) return;

    try {
      // Thinking bubble
      setChatHistory((prev) => {
        if (prev.some((msg) => msg.text === "Thinking...")) {
          return prev;
        }

        return [
          ...prev,
          {
            role: "model",
            text: "Thinking...",
          },
        ];
      });

      // Create conversation memory
      const conversation = updatedHistory
        .filter((msg) => msg.text !== "Thinking...")
        .map((msg) => {
          return `${msg.role === "user" ? "Student" : "Assistant"}:

${msg.text}`;
        })
        .join("\n\n");

      // Create announcement context
      const announcementText =
        announcements.length > 0
          ? announcements
              .map(
                (post, index) => `
Announcement ${index + 1}

Date:
${post.date || "No date provided"}

Details:
${post.content || post.title || "No details provided"}
`
              )
              .join("\n\n")
          : "No announcements found";

      // AI CALL
      const response = await puter.ai.chat(
        `${systemPrompt}


================================
LATEST ICCT ANNOUNCEMENTS
================================

${announcementText}


================================
CONVERSATION HISTORY
================================

${conversation}


RULE:

If the student replies with only a number
(1,2,3,4,5), use the previous menu.

Do not repeat the menu.

Continue the selected option.
`,
        {
          model: "gpt-4o-mini",
        }
      );

      console.log("FULL RESPONSE:", response);

      // Parse response
      let botReply = "";

      if (typeof response === "string") {
        botReply = response;
      } else if (response?.message?.content) {
        botReply = response.message.content;
      } else if (response?.content) {
        botReply = response.content;
      } else if (response?.text) {
        botReply = response.text;
      } else {
        botReply = "No response.";
      }

      // Replace thinking
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        {
          role: "model",
          text: botReply,
        },
      ]);
    } catch (error) {
      console.error("Puter AI error:", error);

      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        {
          role: "model",
          text: "Sorry, something went wrong.",
        },
      ]);
    }
  };

  return (
    <div
      className={`about-page container ${
        showAichat ? "show-aichat" : ""
      } ${pageLeaving ? "page-leave" : ""}`}
    >
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <div className="navbar-container">
          <a
            href="#/"
            className="logo-link"
            onClick={() => playPageLeave()}
          >
            <img
              src={ICCTlogo}
              alt="ICCT Logo"
              className="navbar-logo-img"
            />
          </a>

          <button
            className={`navbar-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
            <li>
              <a href="#/" onClick={() => playPageLeave()}>
                Home
              </a>
            </li>

            <li>
              <a href="#/about" onClick={() => playPageLeave()}>
                About
              </a>
            </li>

            <li>
              <a
                href="https://icct.blackboard.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Blackboard
              </a>
            </li>

            <li>
              <a
                href="https://sms.icct.edu.ph/login/student"
                target="_blank"
                rel="noopener noreferrer"
              >
                ICCT Portal
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ===== ROUTES ===== */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />
      </Routes>

      {/* ===== CHAT TOGGLER ===== */}
      <button
        id="chatbot-toggler"
        onClick={() => setShowAichat((prev) => !prev)}
      >
        <span>💬</span>
        <span>×</span>
      </button>

      {/* ===== AI CHAT POPUP ===== */}
      <div className="aichat-popup">
        <div className="chat-header">
          <div className="header-info">
            <AiChatBotIcon />

            <h2 className="logo-text">AI Chat Support</h2>
          </div>

          <button
            onClick={() => setShowAichat(false)}
            className="material-symbols-outlined"
          >
            keyboard_arrow_down
          </button>
        </div>

        <div className="chat-body" ref={chatBodyRef}>
          {chatHistory.length === 0 && (
            <div className="message bot-message">
              <AiChatBotIcon />

              <p className="message-text">
                Hey there!
                <br />
                How can I help you today?
              </p>
            </div>
          )}

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

// ===== APP WRAPPER =====
const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
