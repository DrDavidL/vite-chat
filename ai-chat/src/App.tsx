import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [response, setResponse] = useState<string>("Hi there! How can I assist you today?");
  const [value, setValue] = useState<string>("");
  const [conversation, setConversation] = useState<{ role: string, content: string }[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("You are the best friend ever, asking questions and wanting to help.");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<string>("0");

  const predefinedPrompts = [
    "You are the best friend ever, asking questions and wanting to help.",
    "Speak like a pirate.",
    "You are a formal and polite assistant."
  ];

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const handleSubmit = async () => {
    const userMessage = { role: "user", content: value };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);

    const response = await axios.post("http://localhost:3006/chatbot", {
      question: value,
      systemPrompt: systemPrompt
    });
    const assistantMessage = { role: "assistant", content: response.data };
    setConversation([...newConversation, assistantMessage]);

    setResponse(response.data);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPromptIndex = e.target.value;
    setSelectedPrompt(newPromptIndex);
    const newPrompt = newPromptIndex === "custom" ? customPrompt : predefinedPrompts[parseInt(newPromptIndex)];
    setSystemPrompt(newPrompt);
    setConversation([...conversation, { role: "system", content: newPrompt }]);
  };

  useEffect(() => {
    if (selectedPrompt === "custom") {
      setSystemPrompt(customPrompt);
    }
  }, [customPrompt, selectedPrompt]);

  return (
    <div className="app-container">
      <div className="settings">
        <h2>Settings</h2>
        <div>
          <label>System Prompt:</label>
          <select value={selectedPrompt} onChange={handlePromptChange}>
            {predefinedPrompts.map((prompt, index) => (
              <option key={index} value={index.toString()}>{prompt}</option>
            ))}
            <option value="custom">Custom</option>
          </select>
          {selectedPrompt === "custom" && (
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              cols={30}
            />
          )}
        </div>
      </div>
      <div className="chat-container">
        <div className="chat-box">
          {conversation.map((msg, index) => (
            <div key={index} className={msg.role === "user" ? "user-message" : msg.role === "assistant" ? "bot-message" : "system-message"}>
              <strong>{msg.role === "user" ? "User: " : msg.role === "assistant" ? "Bot: " : "System: "}</strong>{msg.content}
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
