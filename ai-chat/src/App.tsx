import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [response, setResponse] = useState<string>("Hi there! How can I assist you today?");
  const [value, setValue] = useState<string>("");
  const [conversation, setConversation] = useState<{ role: string, content: string }[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("You are the best friend ever, asking questions and wanting to help.");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const handleSubmit = async () => {
    const userMessage = { role: "user", content: value };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);

    const response = await axios.post("http://localhost:3006/chatbot", { question: value });
    const assistantMessage = { role: "assistant", content: response.data };
    setConversation([...newConversation, assistantMessage]);

    setResponse(response.data);
  };

  return (
    <div className="app-container">
      <div className="settings">
        <h2>Settings</h2>
        <div>
          <label>System Prompt:</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            cols={50}
          />
        </div>
      </div>
      <div className="chat-container">
        <div className="chat-box">
          {conversation.map((msg, index) => (
            <div key={index} className={msg.role === "user" ? "user-message" : "bot-message"}>
              <strong>{msg.role === "user" ? "User: " : "Bot: "}</strong>{msg.content}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input type="text" value={value} onChange={onChange} />
          <button onClick={handleSubmit}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
