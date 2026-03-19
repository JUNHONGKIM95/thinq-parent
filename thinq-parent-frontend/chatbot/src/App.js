import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'bot', text: '안녕하세요, 틔움이 어머니를 위한 전문가 챗봇입니다.' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // 사용자별 대화 기록을 구분하기 위한 고유 세션 ID (실제 서비스 시에는 고유값 생성)
  const sessionId = "user_test_1234";

  // 메시지 추가 시 하단 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 마크다운 기호 제거 함수
  const removeMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')       // **굵게** → 굵게
      .replace(/\*(.*?)\*/g, '$1')            // *기울임* → 기울임
      .replace(/^#{1,6}\s+/gm, '')            // # 제목 → 제목
      .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')  // `코드` → 코드
      .replace(/^\s*[-•]\s+/gm, '')           // - 항목 → 항목
      .replace(/^\s*>\s+/gm, '')              // > 인용 → 인용
      .replace(/(?<!\n)(\n?)(\d+\.)/g, '\n\n$2') // 번호 앞에 줄바꿈 추가
      .replace(/\n{3,}/g, '\n\n')             // 3줄 이상 빈줄 → 2줄로 정리
      .trim();
  };

  // 줄바꿈을 <br>로 렌더링하는 함수
  const renderText = (text) => {
    return text.split('\n').map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    const currentInput = input;
    setInput("");
    
    try {
      /**
       * 1. 로컬 테스트 시: "http://127.0.0.1:8000/ask"
       * 2. GCP 배포 후: "http://<GCP_외부_IP>:8000/ask"
       */
      const res = await axios.post("https://chatbot-api-338378601376.asia-northeast3.run.app/ask", { 
        text: currentInput,
        session_id: sessionId // 백엔드 Query 모델에 맞춘 세션 ID 추가
      });

      const botMsg = { role: 'bot', text: removeMarkdown(res.data.answer) };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Connection Error:", err);
      const errorMsg = err.response?.status === 422 
        ? "데이터 형식이 맞지 않습니다 (session_id 확인)."
        : "서버와 연결할 수 없습니다. 서버 상태를 확인하세요.";
        
      setMessages((prev) => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.card} />
      
      <header style={styles.header}>
        <button type="button" style={styles.backBtn}>
          <span style={styles.backArrow} />
        </button>
        <span style={styles.titleBold}>챗태피티</span>
        <span style={styles.titleRegular}>전문가</span>
      </header>

      <div style={styles.messagesContainer} ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            ...styles.bubbleWrapper, 
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' 
          }}>
            <div style={{ 
              ...styles.bubble, 
              backgroundColor: m.role === 'user' ? '#333' : '#F1F1F5',
              color: m.role === 'user' ? '#FFF' : '#000',
              borderRadius: m.role === 'user' ? '15px 2px 15px 15px' : '2px 15px 15px 15px',
            }}>
              {m.role === 'bot' ? renderText(m.text) : m.text}
            </div>
          </div>
        ))}
        {loading && <div style={styles.loadingText}>답변을 생성 중입니다...</div>}
      </div>

      <div style={styles.inputArea}>
        <input 
          style={styles.input}
          type="text"
          placeholder="메세지를 입력하세요."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={styles.sendBtn} disabled={loading}>
          <span style={{ color: loading ? '#CCC' : '#000', fontSize: '18px' }}>▶</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    position: 'relative',
    width: '100%',
    maxWidth: '450px',
    height: '100vh',
    margin: '0 auto',
    background: '#F0F1F5',
    overflow: 'hidden',
    fontFamily: 'sans-serif',
  },
  card: {
    position: 'absolute',
    width: '90%',
    height: '85%',
    left: '5%',
    top: '10%',
    background: '#FFFFFF',
    borderRadius: '13px',
    zIndex: 0,
  },
  header: {
    position: 'relative',
    zIndex: 1,
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    marginTop: '40px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    position: 'relative',
  },
  backArrow: {
    display: 'block',
    width: '10px',
    height: '10px',
    borderLeft: '2px solid #222',
    borderBottom: '2px solid #222',
    transform: 'rotate(45deg)',
  },
  titleBold: {
    marginLeft: '10px',
    fontWeight: '700',
    fontSize: '20px',
  },
  titleRegular: {
    marginLeft: '5px',
    fontWeight: '400',
    fontSize: '20px',
  },
  messagesContainer: {
    position: 'relative',
    zIndex: 1,
    height: 'calc(100vh - 220px)',
    overflowY: 'auto',
    padding: '20px 40px',
    display: 'flex',
    flexDirection: 'column',
  },
  bubbleWrapper: {
    display: 'flex',
    marginBottom: '15px',
  },
  bubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    fontSize: '14px',
    lineHeight: '1.5',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  inputArea: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '85%',
    height: '50px',
    background: '#FFF',
    border: '1px solid #A0A0A0',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    zIndex: 1,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
  },
  sendBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
  },
  loadingText: {
    fontSize: '12px',
    color: '#888',
    textAlign: 'center',
    marginTop: '10px',
  }
};

export default App;