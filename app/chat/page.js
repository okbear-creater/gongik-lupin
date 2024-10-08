'use client'
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './chat.module.css';
import Link from 'next/link'; 

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AIIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
    </svg>
  );

const AAAAAAIIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExampleButton = ({ category, example, onClick }) => (
  <button className={styles.exampleButton} onClick={() => onClick(example)}>
    <div className={styles.category}>{category}</div>
    <div className={styles.example}>{example}</div>
  </button>
);

const removeMetadata = (text) => {
  return text.replace(/【.*?†source】/g, '');
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showExamples, setShowExamples] = useState(true);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("관련 병역판정 기준을 살펴보고 있어요…");
  const [loadingMessageKey, setLoadingMessageKey] = useState(0);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setLoadingMessage("찾았어요! 기준과 비교 분석하는 중이에요…");
        setLoadingMessageKey(prev => prev + 1);
      }, 3500); // 3.5초 후에 메시지 변경
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let messageContent = input.trim();

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.focus();
    }

    await sendMessage(messageContent);
  };

  const sendMessage = async (text) => {
    const newUserMessage = { role: 'user', content: text };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setShowExamples(false);
    setShowInfoBox(false);
    setIsLoading(true);
    setLoadingMessage("관련 병역판정 기준을 살펴보고 있어요…");
    setLoadingMessageKey(prev => prev + 1);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();
      const cleanedResponse = removeMetadata(data.response).trimStart();
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: cleanedResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (text) => {
    sendMessage(text);
  };

  return (
    <div className={styles.chatContainer}>
      <Link href="/" className={styles.headerLink}>  {/* Add this Link component */}
        <div className={styles.chatHeader}>
          <div className={styles.headerContent}>
            <AIIcon /><h1 className={styles.chatTitle}>공익루팡AI</h1>
          </div>
        </div>
      </Link>
      {showInfoBox && (
        <div className={styles.infoBoxContainer}>
          <div className={styles.infoBox}>
            {/* <h2 className={styles.infoBoxTitle}>🪖 공익루팡AI에 오신 것을 환영합니다!</h2> */}
            <h2 className={styles.infoBoxTitle}>👋 안녕하세요! 공익루팡AI 입니다.</h2>
            <p className={styles.infoBoxContent}>
              나의 공익 판정 가능성을 미리 예측해보세요. 겪었던 증상이나 건강 상태를 입력하고, 최신 병역 기준을 학습한 AI로 나의 공익 여부를 판단해봐요.<br /><br />
              공익루팡AI에서는 최신 병역 기준 데이터를 반영한 예측 결과를 얻을 수 있어요. 입력한 건강 정보는 병역 기준과 비교 분석되어, 나의 예상 신체등급을 확인해 볼 수 있어요.<br /><br />
              병역 고민이 있으신가요? 공익루팡AI로 미리 확인해보세요!
            </p>
          </div>
        </div>
      )}
      <div className={styles.chatMessages}>
        {messages.map((message, index) => (
          <div key={index} className={styles.messageWrapper} style={index === 0 ? {borderTop: 'none'} : {}}>
            {message.role === 'user' ? (
              <div className={styles.userIcon}>
                <UserIcon />
              </div>
            ) : (
              <div className={styles.aiIcon}>
                <AIIcon />
              </div>
            )}
            <div className={styles.messageInner}>
              <div className={`${styles.message} ${styles[message.role]}`}>
                <div className={`${styles.messageContent} ${message.role === 'assistant' ? styles.fadeIn : ''}`}>
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={styles.messageWrapper} style={messages.length === 0 ? {borderTop: 'none'} : {}}>
            <div className={styles.aiIcon}>
              <AIIcon />
            </div>
            <div className={styles.messageInner}>
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.loadingMessage}>
                  <div key={loadingMessageKey} className={styles.loadingMessageContent}>
                    {loadingMessage}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {showExamples && (
        <div className={styles.exampleContainer}>
          <ExampleButton category="🍲 BMI지수" example="저는 170cm에 90kg에요" onClick={handleExampleClick} />
          <ExampleButton category="👁️ 시력" example="제 시력은 0.1/0.1이에요" onClick={handleExampleClick} />
          <ExampleButton category="🦶 평발" example="왼발 종골 경사각이 34도에요" onClick={handleExampleClick} />
          <ExampleButton category="🏥 수술" example="십자인대 파열로 수술한 적이 있어요" onClick={handleExampleClick} />
        </div>
      )}
      <div className={styles.inputWrapper}>
        <div className={styles.inputContainer}>
          <form onSubmit={handleSubmit} className={styles.chatInputForm}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="나의 건강 상태를 입력해봐요"
              className={styles.chatInput}
              rows={1}
            />
            <button 
              type="submit" 
              className={`${styles.chatSubmit} ${input.trim() ? styles.active : styles.inactive}`}
              disabled={!input.trim()}
            >
              <span className={styles.submitArrow}>&#8593;</span>
            </button>
          </form>
          <div className={styles.lastModified}>본 서비스의 병역판정 기준은 2024년 8월 15일 업데이트된 검사규칙을 따릅니다.</div>
        </div>
      </div>
    </div>
  );
}
