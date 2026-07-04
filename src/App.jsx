import { useState, useEffect } from 'react';
import './App.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSKdl0SjE5jNEeyq4CNxPwUkAFRzgZdxAMBikcbMu2ZPSBXeEHt2iAUrSzHLxok2Dq8Q/exec';

function App() {
  const [role, setRole] = useState(null); 
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [startId, setStartId] = useState('1');
  const [endId, setEndId] = useState('50');
  
  const [loading, setLoading] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [card, setCard] = useState([]);
  const [marked, setMarked] = useState(Array(25).fill(false));
  const [currentClues, setCurrentClues] = useState([]);
  const [latestClue, setLatestClue] = useState(null);
  const [players, setPlayers] = useState([]);
  const [timerData, setTimerData] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timeLimit, setTimeLimit] = useState('30');

  // Custom Toast & Modal State
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const resetGame = () => {
    setRole(null);
    setRoomCode('');
    setPlayerName('');
    setTeacherPhone('');
    setTeacherName('');
    setInGame(false);
    setCard([]);
    setMarked(Array(25).fill(false));
    setCurrentClues([]);
    setLatestClue(null);
    setTimerData(null);
    setRemainingTime(0);
  };

  const handleJoinRoom = async () => {
    if (!roomCode || !playerName) return showToast('กรุณากรอกรหัสห้องและชื่อให้ครบถ้วน', 'error');
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=joinRoom&roomCode=${encodeURIComponent(roomCode)}&playerName=${encodeURIComponent(playerName)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCard(data.card);
        setInGame(true);
        const newMarked = Array(25).fill(false);
        const freeIndex = data.card.indexOf('FREE SPACE');
        if(freeIndex !== -1) newMarked[freeIndex] = true;
        setMarked(newMarked);
        showToast('เข้าสู่ห้องสอบสำเร็จ', 'success');
      } else {
        showToast(data.message || 'ไม่สามารถเข้าร่วมห้องได้', 'error');
      }
    } catch (err) {
      showToast('การเชื่อมต่อล้มเหลว: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const toggleMark = (index) => {
    if (card[index] === 'FREE SPACE') return;
    if (timerData && !timerData.isPaused && remainingTime <= 0) {
      return showToast('หมดเวลา! ไม่สามารถตอบคำถามนี้ได้แล้ว', 'error');
    }
    
    const newMarked = [...marked];
    
    if (!newMarked[index]) {
      const currentMarkedCount = newMarked.filter(Boolean).length;
      const maxAllowed = currentClues.length + 1; // +1 for Free Space
      if (currentMarkedCount >= maxAllowed) {
        return showToast('คุณตอบเกินจำนวนคำใบ้แล้ว! กรุณาเอาติ๊กอันเก่าออกก่อนตอบใหม่', 'error');
      }
    }
    
    newMarked[index] = !newMarked[index];
    setMarked(newMarked);
  };

  const confirmBingo = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const markedStr = encodeURIComponent(JSON.stringify(marked));
      const res = await fetch(`${SCRIPT_URL}?action=bingo&roomCode=${encodeURIComponent(roomCode)}&playerName=${encodeURIComponent(playerName)}&marked=${markedStr}`);
      const data = await res.json();
      if (data.status === 'success') {
        showToast('🎉 ยินดีด้วย! บันทึกสถานะ BINGO สำเร็จ 🎉', 'success');
      } else if (data.status === 'cheat') {
        showToast(data.message, 'error');
        setTimeout(() => resetGame(), 3000); // ดีดออกหลัง 3 วินาที
      } else {
        showToast(data.message || 'ไม่สามารถบันทึกสถานะได้', 'error');
      }
    } catch (err) {
      showToast('การเชื่อมต่อล้มเหลว', 'error');
    }
    setLoading(false);
  };

  const handleTeacherLogin = async () => {
    if (!teacherPhone) return showToast('กรุณากรอกเบอร์โทรศัพท์', 'error');
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=teacherLogin&phone=${encodeURIComponent(teacherPhone)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setTeacherName(data.name);
        showToast(`ยินดีต้อนรับ ครู${data.name}`, 'success');
      } else {
        showToast(data.message || 'ขออภัย ไม่พบข้อมูลการลงทะเบียน', 'error');
      }
    } catch (err) {
      showToast('การเชื่อมต่อล้มเหลว: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    const sId = parseInt(startId) || 1;
    const eId = parseInt(endId) || 50;
    if (eId - sId < 49) {
      return showToast('ช่วงคำถามต้องห่างกันอย่างน้อย 50 ข้อ (เช่น 1-50)', 'error');
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=createRoom&startId=${sId}&endId=${eId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setRoomCode(data.roomCode);
        setInGame(true);
        showToast('เปิดห้องเรียนสำเร็จ', 'success');
      } else {
        showToast('ไม่สามารถสร้างห้องได้', 'error');
      }
    } catch (err) {
      showToast('การเชื่อมต่อล้มเหลว: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const drawNextClue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=drawClue&roomCode=${encodeURIComponent(roomCode)}&duration=${timeLimit}`);
      const data = await res.json();
      if (data.status === 'success') {
        setLatestClue({ clue: data.clue, answer: data.answer });
        setCurrentClues(data.allClues);
        setTimerData(data.timerData);
        showToast('สุ่มคำใบ้ใหม่สำเร็จ', 'success');
      } else {
        showToast(data.message || 'ไม่มีคำใบ้เหลือแล้ว', 'error');
      }
    } catch (err) {
      showToast('ดึงคำใบ้ล้มเหลว', 'error');
    }
    setLoading(false);
  };

  const handleEndRoom = async () => {
    if (!roomCode) {
      resetGame();
      return;
    }
    setLoading(true);
    try {
      await fetch(`${SCRIPT_URL}?action=endRoom&roomCode=${encodeURIComponent(roomCode)}`);
      showToast('ปิดห้องเรียนสำเร็จ', 'success');
      resetGame();
    } catch (err) {
      console.error(err);
      resetGame();
    }
    setLoading(false);
  };

  const fetchRoomStatus = async () => {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getRoomStatus&roomCode=${roomCode}`);
      const data = await res.json();
      if (data.status === 'success') {
        if (data.roomStatus === 'ended') {
           showToast('คุณครูได้ปิดห้องเรียนแล้ว', 'info');
           resetGame();
           return;
        }
        setPlayers(data.players || []);
        if (data.clues) {
            setCurrentClues(data.clues);
            if(data.clues.length > 0) {
                setLatestClue({ clue: data.clues[data.clues.length - 1] });
            }
        }
        if (data.timerData) {
            setTimerData(data.timerData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let interval = null;
    if (inGame && roomCode) {
      fetchRoomStatus();
      interval = setInterval(fetchRoomStatus, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inGame, roomCode]);

  useEffect(() => {
    let tick = null;
    if (timerData) {
      tick = setInterval(() => {
        if (timerData.isPaused) {
          setRemainingTime(Math.floor(timerData.remainingTime / 1000));
        } else {
          const rem = Math.max(0, Math.floor((timerData.expiresAt - Date.now()) / 1000));
          setRemainingTime(rem);
        }
      }, 500);
    }
    return () => { if(tick) clearInterval(tick); };
  }, [timerData]);

  const togglePause = async () => {
    if (!timerData) return;
    setLoading(true);
    const act = timerData.isPaused ? 'resumeTimer' : 'pauseTimer';
    try {
      const res = await fetch(`${SCRIPT_URL}?action=${act}&roomCode=${encodeURIComponent(roomCode)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setTimerData(data.timerData);
      }
    } catch (err) { }
    setLoading(false);
  };


  // Toast UI
  const renderToast = () => (
    <div className={`toast-notification ${toast.show ? 'show' : ''} ${toast.type}`}>
      <div className="toast-icon">
        {toast.type === 'success' ? '✧' : toast.type === 'error' ? '⚠' : 'ℹ'}
      </div>
      <div className="toast-message">{toast.message}</div>
    </div>
  );

  // Custom Confirm Modal UI
  const renderConfirmModal = () => (
    <div className={`modal-overlay ${showConfirmModal ? 'show' : ''}`}>
      <div className="modal-content glass-panel">
        <h2 className="section-title">ประกาศชัยชนะ</h2>
        <div className="gold-divider-small"></div>
        <p className="description">คุณตรวจสอบความถูกต้องของกระดานแล้ว และต้องการประกาศ BINGO ใช่หรือไม่?</p>
        <div className="modal-actions mt-4">
          <button className="btn-luxury" onClick={confirmBingo}>
            <span className="btn-text-main">ยืนยัน BINGO</span>
          </button>
          <button className="btn-luxury-outline" onClick={() => setShowConfirmModal(false)}>
            <span className="btn-text-main">ยกเลิก</span>
          </button>
        </div>
      </div>
    </div>
  );


  // Render Main Screen
  if (!role) {
    return (
      <div className="app-container">
        {renderToast()}
        <div className="glass-panel">
          <header className="header">
            <h4 className="subtitle">The Legacy of Siam</h4>
            <h1 className="title">Thai History Bingo</h1>
            <div className="gold-divider"></div>
            <p className="description">สัมผัสประสบการณ์แห่งความรู้ผ่านมนต์เสน่ห์แห่งประวัติศาสตร์</p>
          </header>
          
          <div className="role-selection" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button className="btn-luxury" style={{ width: '100%' }} onClick={() => setRole('student')}>
              <span className="btn-text-main">เข้าร่วมการทดสอบ</span>
              <span className="btn-text-sub">คลิกที่นี่สำหรับนักเรียน</span>
            </button>
            
            <button 
              onClick={() => setRole('teacher')}
              style={{
                marginTop: '2rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--gold-light)',
                opacity: 0.4,
                cursor: 'pointer',
                fontSize: '0.85rem',
                textDecoration: 'underline',
                transition: 'opacity 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = 0.8}
              onMouseLeave={(e) => e.target.style.opacity = 0.4}
            >
              (ระบบจัดการสำหรับคุณครู)
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (role === 'student') {
    if (!inGame) {
      return (
        <div className="app-container">
          {renderToast()}
          <div className="glass-panel">
            <h2 className="section-title">เข้าร่วมการทดสอบ</h2>
            <div className="gold-divider-small"></div>
            <div className="form-group">
              <div className="input-wrapper">
                <label>รหัสห้อง (Room Code)</label>
                <input 
                  type="text" 
                  placeholder="กรอกรหัส 6 หลักที่ได้จากครู" 
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label>นามเรียกขาน (Your Name)</label>
                <input 
                  type="text" 
                  placeholder="ระบุชื่อของคุณ" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
              <button className="btn-luxury mt-4" onClick={handleJoinRoom} disabled={loading}>
                <span className="btn-text-main">{loading ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่สนามสอบ'}</span>
              </button>
              <button className="btn-back" onClick={resetGame} disabled={loading}>กลับสู่หน้าหลัก</button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="app-container full-width">
        {renderToast()}
        {renderConfirmModal()}
        <div className="glass-panel wide-panel">
          <div className="top-bar">
            <span>👤 {playerName}</span>
            <span className="room-badge">รหัสห้อง: {roomCode}</span>
          </div>
          
          <div className="clue-display student-clue">
            <h4>คำใบ้ล่าสุดจากห้องเรียน:</h4>
            <div className="clue-box animated-reveal">
              {latestClue ? latestClue.clue : 'รอคุณครูสุ่มคำใบ้...'}
            </div>
            {timerData && (
              <div className="timer-container mt-4">
                <div className="timer-bar" style={{ width: `${(remainingTime / timerData.duration) * 100}%`, backgroundColor: remainingTime <= 5 ? '#ff4d4f' : 'var(--color-gold)' }}></div>
                <div className="timer-text" style={{ color: remainingTime <= 5 ? '#ff4d4f' : 'var(--color-gold-light)' }}>
                  {timerData.isPaused ? 'หยุดเวลาชั่วคราว' : remainingTime > 0 ? `เหลือเวลา ${remainingTime} วินาที` : 'หมดเวลา! ล็อกการตอบ'}
                </div>
              </div>
            )}
          </div>

          <div className="bingo-board">
            {card.map((item, index) => (
              <div 
                key={index} 
                className={`bingo-cell ${marked[index] ? 'marked' : ''} ${item === 'FREE SPACE' ? 'free-space' : ''}`}
                onClick={() => toggleMark(index)}
              >
                {item}
              </div>
            ))}
          </div>

          <button className="btn-luxury bingo-btn" onClick={() => setShowConfirmModal(true)} disabled={loading}>
            <span className="btn-text-main">BINGO!</span>
          </button>
        </div>
      </div>
    )
  }

  if (role === 'teacher') {
    if (!teacherName) {
      return (
        <div className="app-container">
          {renderToast()}
          <div className="glass-panel">
            <h2 className="section-title">เข้าสู่ระบบผู้คุมสอบ</h2>
            <div className="gold-divider-small"></div>
            <div className="form-group">
              <div className="input-wrapper">
                <label>เบอร์โทรศัพท์ (รหัสผ่าน)</label>
                <input 
                  type="tel" 
                  placeholder="กรอกเบอร์โทรศัพท์ที่ลงทะเบียนไว้" 
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                />
              </div>
              <button className="btn-luxury mt-4" onClick={handleTeacherLogin} disabled={loading}>
                <span className="btn-text-main">{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</span>
              </button>
              <button className="btn-back" onClick={resetGame} disabled={loading}>กลับสู่หน้าหลัก</button>
            </div>
          </div>
        </div>
      )
    }

    if (!inGame) {
      return (
        <div className="app-container">
          {renderToast()}
          <div className="glass-panel">
            <h2 className="section-title">ระบบจัดการห้องเรียน</h2>
            <div className="gold-divider-small"></div>
            <div className="form-group center-content">
              <p className="teacher-desc" style={{ color: 'var(--gold-light)' }}>ยินดีต้อนรับ, ครู{teacherName}</p>
              <p className="teacher-desc">กำหนดช่วงข้อสอบสำหรับการสร้างห้อง (ขั้นต่ำ 50 ข้อ)</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <label>ข้อเริ่มต้น (Start)</label>
                  <input type="number" value={startId} onChange={e => setStartId(e.target.value)} min="1" />
                </div>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <label>ข้อสิ้นสุด (End)</label>
                  <input type="number" value={endId} onChange={e => setEndId(e.target.value)} min="50" />
                </div>
              </div>
              <button className="btn-luxury mt-4" onClick={handleCreateRoom} disabled={loading}>
                <span className="btn-text-main">{loading ? 'กำลังสร้างห้อง...' : 'เปิดห้องเรียนใหม่'}</span>
              </button>
              <button className="btn-back" onClick={resetGame} disabled={loading}>กลับสู่หน้าหลัก</button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="app-container full-width">
        {renderToast()}
        <div className="glass-panel wide-panel">
          <div className="teacher-dashboard">
            <div className="dashboard-left">
              <h2 className="room-code-large">รหัสห้อง: <span>{roomCode}</span></h2>
              <div className="gold-divider-small" style={{margin: '1rem 0'}}></div>
              <p style={{color: 'var(--gold-light)', marginBottom: '1.5rem'}}>ผู้ควบคุมการทดสอบ: ครู{teacherName}</p>
              
              <div className="clue-display">
                <h4>สุ่มคำถาม:</h4>
                <div className="input-wrapper" style={{ marginBottom: '1rem', width: '200px' }}>
                  <label>เวลาให้ตอบ (วินาที)</label>
                  <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} min="10" />
                </div>
                <div className="clue-box large animated-reveal">
                  {latestClue ? latestClue.clue : 'ยังไม่ได้เริ่มสุ่ม'}
                </div>
                {latestClue && latestClue.answer && (
                  <div className="answer-box">เฉลย: {latestClue.answer}</div>
                )}
                
                {timerData && (
                  <div className="timer-container mt-4">
                    <div className="timer-bar" style={{ width: `${(remainingTime / timerData.duration) * 100}%`, backgroundColor: remainingTime <= 5 ? '#ff4d4f' : 'var(--color-gold)' }}></div>
                    <div className="timer-text" style={{ color: remainingTime <= 5 ? '#ff4d4f' : 'var(--color-gold-light)' }}>
                      {timerData.isPaused ? 'หยุดเวลาชั่วคราว' : remainingTime > 0 ? `เหลือเวลา ${remainingTime} วินาที` : 'หมดเวลา'}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn-luxury" onClick={drawNextClue} disabled={loading} style={{ flex: 2 }}>
                    <span className="btn-text-main">{loading ? 'กำลังสุ่ม...' : 'สุ่มคำใบ้ต่อไป'}</span>
                  </button>
                  {timerData && (
                    <button className="btn-luxury-outline" onClick={togglePause} disabled={loading} style={{ flex: 1 }}>
                      <span className="btn-text-main">{timerData.isPaused ? '▶ เล่นต่อ' : '⏸ หยุดเวลา'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="dashboard-right">
              <h3>ผู้เข้าร่วมสอบ ({players.length})</h3>
              <div className="player-list">
                {players.length === 0 ? <p className="text-muted">รอผู้เล่นเข้าร่วม...</p> : null}
                {players.map((p, i) => (
                  <div key={i} className={`player-item ${p.isBingo ? 'winner' : ''}`}>
                    <span className="player-name">{p.name}</span>
                    {p.isBingo && <span className="bingo-tag">BINGO! 🎉</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="btn-back mt-4" style={{display:'block', textAlign:'center', width:'100%'}} onClick={handleEndRoom}>ปิดห้องเรียน (จบเกม)</button>
        </div>
      </div>
    )
  }
}

export default App
