import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollButtonRef = useRef(null);

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      setIsTyping(true);

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: 'This is a bot response.', sender: 'bot' },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop > clientHeight + 100) {
      scrollButtonRef.current.classList.add('show');
    } else {
      scrollButtonRef.current.classList.remove('show');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">Chat</div>
      <div className="chat-messages" onScroll={handleScroll}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Bot is typing...</div>}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div
        className="scroll-to-bottom"
        ref={scrollButtonRef}
        onClick={scrollToBottom}
      >
        ↓
      </div>
    </div>
  );
};

export default ChatWindow;
