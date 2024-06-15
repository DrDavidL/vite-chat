import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [response, setResponse] = useState<string>("Hi there! How can I assist you today?");
  const [value, setValue] = useState<string>("");
  const [conversation, setConversation] = useState<{ role: string, content: string }[]>([]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const handleSubmit = async () => {
    const userMessage = { role: "user", content: value };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);

    const response = await axios.post("http://localhost:3005/chatbot", { question: value });
    const assistantMessage = { role: "assistant", content: response.data };
    setConversation([...newConversation, assistantMessage]);

    setResponse(response.data);
  };

  return (
    <div className="container">
      <div>
        <input type="text" value={value} onChange={onChange} />
      </div>
      <div>
        <button onClick={handleSubmit}>Click me for answers!</button>
      </div>
      <div>
        <p>Chatbot: {response}</p>
      </div>
    </div>
  );
}

export default App;
