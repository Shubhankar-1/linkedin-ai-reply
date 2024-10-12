import React, { useState } from 'react';
import './style.css'
const App = () => {
  const [command, setCommand] = useState('');
  const [messages, setMessages] = useState<{ type: 'prompt' | 'response', text: string }[]>([]);
  const [error, setError] = useState("")

  const handleGenerate = () => {

    if (!command) {
      setError("Please enter a prompt before submitting.")
      return
    } else {
      setError('')
    }
    // Add the prompt to messages
    setMessages(prev => [...prev, { type: 'prompt', text: command }]);

    // Simulate a response (replace this with actual API call later)
    const response = 'Thank you for the opportunity! If you have any more questions or if there\'s anything else I can help you with, feel free to ask.';

    // Add the response to messages
    setMessages(prev => [...prev, { type: 'response', text: response }]);

    // Clear the input
    setCommand('');
  };

  const handleInsert = (text: string) => {
    // Send a message to the content script
    window.postMessage({ type: 'FROM_REACT', action: "insertText", text }, '*');
  };

  return (
    <form className="p-6 bg-[#F9FAFB] rounded-lg shadow-lg relative w-full md:w-1/2">
      {messages.length > 0 &&
        <div className="mb-4 h-64 overflow-y-auto  rounded-md p-2">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.type === 'prompt' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.type === 'prompt' ? 'bg-[#dfe1e7] text-[#666d80]' : 'bg-[#dbeafe] text-[#666d80]'
                }`}>
                {message.text}
              </span>
            </div>
          ))}
        </div>
      }
      <input
        name='prompt_input'
        id='prompt_input'
        className="outline-0 border-0 p-2 w-full mb-4 rounded-md"
        type="text"
        required
        placeholder="Your prompt"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />
      {error && (
        <p className="text-red-500 ">{error}</p>
      )}
      <div className='flex justify-end gap-5'>
        {messages.length > 0 && (
          <>
            <button
              className="outline-1 border border-[#666d80] text-[#666d80] px-4 py-1 rounded font-semibold"
              onClick={() => handleInsert(messages[messages.length - 1].text)}
            >
              Insert
            </button>
            <button
              id='regenerate'
              type='submit'
              className="bg-blue-500 text-white px-4 py-1 rounded font-semibold"
              // onClick={handleGenerate}
              disabled
            >
              Regenerate
            </button>
          </>
        )}
        {messages.length === 0 && (
          <button
            id='generate'
            type='submit'
            className="bg-blue-500 text-white px-4 py-1 rounded font-semibold"
            onClick={handleGenerate}
          >
            Generate
          </button>
        )}
      </div>
    </form>
  );
};

export default App;
