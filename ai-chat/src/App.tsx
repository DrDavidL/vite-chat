import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import "./App.css";

function App() {
  const [response, setResponse] = useState<string>("Hi there! How can I assist you today?");
  const [value, setValue] = useState<string>("");
  const [conversation, setConversation] = useState<{ role: string, content: string }[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("You are the best friend ever, asking questions and wanting to help.");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<string>("0");
  const [pendingPrompt, setPendingPrompt] = useState<string>("You are the best friend ever, asking questions and wanting to help.");

  const predefinedPrompts = [
    "You are the best friend ever, asking questions and wanting to help.",
    "Speak like a pirate.",
    "You are a formal and polite assistant.",
    "You are a sarcastic assistant.",
  ];

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const handleSubmit = async () => {
    if (value.trim() === "") return;

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
    setValue("");
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPromptIndex = e.target.value;
    setSelectedPrompt(newPromptIndex);
    const newPrompt = newPromptIndex === "custom" ? customPrompt : predefinedPrompts[parseInt(newPromptIndex)];
    setPendingPrompt(newPrompt);
  };

  const handleUpdatePersona = () => {
    setSystemPrompt(pendingPrompt);
    setConversation([...conversation, { role: "system", content: pendingPrompt }]);
  };

  useEffect(() => {
    if (selectedPrompt === "custom") {
      setPendingPrompt(customPrompt);
    }
  }, [customPrompt, selectedPrompt]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      useEffect(() => {
        Prism.highlightAll();
      }, [children]);

      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <pre className={className} {...props}>
          <code className={`language-${match[1]}`}>{String(children).replace(/\n$/, '')}</code>
        </pre>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="app-container">
      <div className="settings">
        <h2>Vite Chat</h2>
        <h3 style={{ fontSize: '14px' }}>Author: David Liebovitz</h3>
        <h3>Settings</h3>
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
          <button onClick={handleUpdatePersona}>Update Persona</button>
        </div>
      </div>
      <div className="chat-container">
        <div className="chat-box">
          {conversation.map((msg, index) => (
            <div key={index} className={msg.role === "user" ? "user-message" : msg.role === "assistant" ? "bot-message" : "system-message"}>
              <strong>{msg.role === "user" ? "🙋🏽| " : msg.role === "assistant" ? "🤖| " : "🎭|"}</strong> <ReactMarkdown components={components} className="markdown">{msg.content}</ReactMarkdown>
            </div>
          ))}
        </div>
        <div className="input-container">
          <input type="text" value={value} onChange={onChange} onKeyPress={handleKeyPress} />
          <button onClick={handleSubmit}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
