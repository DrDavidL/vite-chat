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
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const predefinedPrompts = [
    "You are the best friend ever, asking questions and wanting to help.",
    "Speak like a pirate.",
    "You are a formal and polite assistant.",
    "You are a sarcastic assistant.",
  ];

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const handleSubmit = async () => {
    if (value.trim() === "") return;

    setLoading(true);
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
    setLoading(false);
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
    <div className={darkMode ? "min-h-screen bg-gray-900 text-white flex" : "min-h-screen bg-white text-gray-900 flex"}>
      <div className="settings p-4 w-1/4">
        <h2 className="text-3xl font-bold">Vite Chat</h2>
        <h3 className="text-xl">Author: David Liebovitz</h3>
        <h3 className="text-lg mt-4">Settings</h3>
        <div className="mt-2">
          <label className="block text-sm">System Prompt:</label>
          <select value={selectedPrompt} onChange={handlePromptChange} className={darkMode ? "w-full bg-gray-800 text-white p-2 rounded mt-1" : "w-full bg-gray-200 text-black p-2 rounded mt-1"}>
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
              className={darkMode ? "w-full bg-gray-800 text-white p-2 rounded mt-1" : "w-full bg-gray-200 text-black p-2 rounded mt-1"}
            />
          )}
          <button onClick={handleUpdatePersona} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
            Update Persona
          </button>
        </div>
      </div>
      <div className="chat-container flex-grow p-4 w-3/4">
        <button onClick={() => setDarkMode(!darkMode)} className={darkMode ? "mb-4 p-2 rounded bg-gray-800 text-white transition duration-300 ease-in-out hover:bg-gray-700" : "mb-4 p-2 rounded bg-gray-200 text-black transition duration-300 ease-in-out hover:bg-gray-300"}>
          Toggle {darkMode ? "Light" : "Dark"} Mode
        </button>
        <div className="chat-box bg-gray-800 p-4 rounded-lg overflow-y-auto h-96">
          {conversation.map((msg, index) => (
            <div key={index} className={`p-2 mb-2 ${msg.role === "user" ? "bg-blue-600" : msg.role === "assistant" ? "bg-green-600" : "bg-gray-700"} rounded`}>
              <strong>{msg.role === "user" ? "🙋🏽| " : msg.role === "assistant" ? "🤖| " : "🎭|"}</strong> <ReactMarkdown components={components} className="markdown">{msg.content}</ReactMarkdown>
            </div>
          ))}
        </div>
        <div className="input-container mt-4 flex">
          <input type="text" value={value} onChange={onChange} onKeyPress={handleKeyPress} className={darkMode ? "w-full bg-gray-800 text-white p-2 rounded-l-lg" : "w-full bg-gray-200 text-black p-2 rounded-l-lg"} />
          <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
