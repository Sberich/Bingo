import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

// Hooks
import { useToast } from './hooks/useToast';
import { useGameTimer } from './hooks/useGameTimer';
import { useRoomPolling } from './hooks/useRoomPolling';

// Components
import { Toast } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { RoleSelect } from './components/RoleSelect';
import { StudentJoin } from './components/StudentJoin';
import { StudentGame } from './components/StudentGame';
import { TeacherLogin } from './components/TeacherLogin';
import { TeacherSetup } from './components/TeacherSetup';
import { TeacherDashboard } from './components/TeacherDashboard';

const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL;

function App() {
  const { toast, showToast } = useToast();
  
  // App State
  const [role, setRole] = useState(() => localStorage.getItem('role') || null); 
  const [roomCode, setRoomCode] = useState(() => localStorage.getItem('roomCode') || '');
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem('teacherName') || '');
  const [startId, setStartId] = useState('1');
  const [endId, setEndId] = useState('50');
  
  const [loading, setLoading] = useState(false);
  const [inGame, setInGame] = useState(() => localStorage.getItem('inGame') === 'true');
  const [card, setCard] = useState(() => JSON.parse(localStorage.getItem('card') || '[]'));
  const [marked, setMarked] = useState(() => JSON.parse(localStorage.getItem('marked') || '[]'));
  
  const [currentClues, setCurrentClues] = useState([]);
  const [latestClueText, setLatestClueText] = useState(null);
  const [latestAnswer, setLatestAnswer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [timerData, setTimerData] = useState(null);
  const [timeLimit, setTimeLimit] = useState('30');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (role) localStorage.setItem('role', role);
    else localStorage.removeItem('role');
    
    if (roomCode) localStorage.setItem('roomCode', roomCode);
    else localStorage.removeItem('roomCode');
    
    if (playerName) localStorage.setItem('playerName', playerName);
    else localStorage.removeItem('playerName');
    
    if (teacherName) localStorage.setItem('teacherName', teacherName);
    else localStorage.removeItem('teacherName');
    
    localStorage.setItem('inGame', inGame.toString());
    localStorage.setItem('card', JSON.stringify(card));
    localStorage.setItem('marked', JSON.stringify(marked));
  }, [role, roomCode, playerName, teacherName, inGame, card, marked]);

  const remainingTime = useGameTimer(timerData);

  const resetGame = useCallback(() => {
    setRole(null);
    setRoomCode('');
    setPlayerName('');
    setTeacherPhone('');
    setTeacherName('');
    setInGame(false);
    setCard([]);
    setMarked([]);
    setCurrentClues([]);
    setLatestClueText(null);
    setLatestAnswer(null);
    setTimerData(null);
    setShowConfirmModal(false);
    
    // Clear only app specific keys so we don't wipe out other apps on the same domain
    ['role', 'roomCode', 'playerName', 'teacherName', 'inGame', 'card', 'marked'].forEach(key => localStorage.removeItem(key));
  }, []);

  useRoomPolling({
    roomCode,
    inGame,
    scriptUrl: SCRIPT_URL,
    setPlayers,
    setCurrentClues,
    setLatestClueText,
    setTimerData,
    resetGame,
    showToast
  });

  const handleJoinRoom = async () => {
    const code = roomCode.trim().toUpperCase();
    const name = playerName.trim();
    if (!code || !name) return showToast('กรอกข้อมูลไม่ครบถ้วน', 'error');
    
    setRoomCode(code);
    setPlayerName(name);
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=joinRoom&roomCode=${encodeURIComponent(code)}&playerName=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Network response was not ok');
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
      showToast('เชื่อมต่อล้มเหลว ตรวจสอบอินเทอร์เน็ต', 'error');
    }
    setLoading(false);
  };

  const toggleMark = (index) => {
    if (card[index] === 'FREE SPACE') return;
    if (timerData && !timerData.isPaused && remainingTime <= 0) {
      return showToast('หมดเวลาตอบข้อนี้แล้ว!', 'error');
    }
    
    const newMarked = [...marked];
    
    if (!newMarked[index]) {
      const currentMarkedCount = newMarked.filter(Boolean).length;
      const maxAllowed = currentClues.length + 1; // +1 for Free Space
      if (currentMarkedCount >= maxAllowed) {
        return showToast('คุณเลือกคำตอบไปแล้ว', 'error');
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
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.status === 'success') {
        showToast('🎉 บันทึกสถานะ BINGO สำเร็จ! 🎉', 'success');
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
      } else if (data.status === 'cheat') {
        showToast(data.message, 'error');
        setTimeout(() => resetGame(), 3000); // Kick out
      } else {
        showToast(data.message || 'ไม่สามารถบันทึกสถานะได้', 'error');
      }
    } catch (err) {
      showToast('การเชื่อมต่อล้มเหลว', 'error');
    }
    setLoading(false);
  };

  const handleTeacherLogin = async () => {
    const phone = teacherPhone.trim();
    if (!phone) return showToast('กรุณากรอกเบอร์โทรศัพท์', 'error');
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=teacherLogin&phone=${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.status === 'success') {
        setTeacherName(data.name);
        showToast(`ยินดีต้อนรับ ครู${data.name}`, 'success');
      } else {
        showToast(data.message || 'ขออภัย ไม่พบข้อมูลการลงทะเบียน', 'error');
      }
    } catch (err) {
      showToast('เชื่อมต่อล้มเหลว ตรวจสอบอินเทอร์เน็ต', 'error');
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    const sId = Number.isNaN(parseInt(startId, 10)) ? 1 : parseInt(startId, 10);
    const eId = Number.isNaN(parseInt(endId, 10)) ? 50 : parseInt(endId, 10);
    
    if (eId - sId < 49) {
      return showToast('ระยะคำถามต้องห่างกัน 50 ข้อขึ้นไป', 'error');
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=createRoom&startId=${sId}&endId=${eId}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.status === 'success') {
        setRoomCode(data.roomCode);
        setInGame(true);
        showToast('เปิดห้องเรียนสำเร็จ', 'success');
      } else {
        showToast('ไม่สามารถสร้างห้องได้', 'error');
      }
    } catch (err) {
      showToast('เชื่อมต่อล้มเหลว', 'error');
    }
    setLoading(false);
  };

  const drawNextClue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=drawClue&roomCode=${encodeURIComponent(roomCode)}&duration=${timeLimit}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.status === 'success') {
        setLatestClueText(data.clue);
        setLatestAnswer(data.answer);
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

  const togglePause = async () => {
    if (!timerData) return;
    setLoading(true);
    const act = timerData.isPaused ? 'resumeTimer' : 'pauseTimer';
    try {
      const res = await fetch(`${SCRIPT_URL}?action=${act}&roomCode=${encodeURIComponent(roomCode)}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.status === 'success') {
        setTimerData(data.timerData);
      }
    } catch (err) { 
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className={`app-container ${inGame ? 'full-width' : ''}`}>
      <div className="golden-dust"></div>
      <div className="meteor meteor-1"></div>
      <div className="meteor meteor-2"></div>
      <div className="meteor meteor-3"></div>
      <div className="meteor meteor-4"></div>
      <Toast toast={toast} />
      <ConfirmModal 
        show={showConfirmModal} 
        onConfirm={confirmBingo} 
        onCancel={() => setShowConfirmModal(false)} 
      />

      {!role && <RoleSelect setRole={setRole} />}

      {role === 'student' && !inGame && (
        <StudentJoin 
          roomCode={roomCode} setRoomCode={setRoomCode}
          playerName={playerName} setPlayerName={setPlayerName}
          onJoin={handleJoinRoom} onBack={resetGame} loading={loading}
        />
      )}

      {role === 'student' && inGame && (
        <StudentGame 
          playerName={playerName} roomCode={roomCode}
          latestClueText={latestClueText} timerData={timerData} remainingTime={remainingTime}
          card={card} marked={marked} toggleMark={toggleMark}
          onBingo={() => setShowConfirmModal(true)} loading={loading}
        />
      )}

      {role === 'teacher' && !teacherName && (
        <TeacherLogin 
          teacherPhone={teacherPhone} setTeacherPhone={setTeacherPhone}
          onLogin={handleTeacherLogin} onBack={resetGame} loading={loading}
        />
      )}

      {role === 'teacher' && teacherName && !inGame && (
        <TeacherSetup 
          teacherName={teacherName} 
          startId={startId} setStartId={setStartId} 
          endId={endId} setEndId={setEndId}
          onCreateRoom={handleCreateRoom} onBack={resetGame} loading={loading}
        />
      )}

      {role === 'teacher' && teacherName && inGame && (
        <TeacherDashboard 
          roomCode={roomCode} teacherName={teacherName}
          timeLimit={timeLimit} setTimeLimit={setTimeLimit}
          latestClueText={latestClueText} latestAnswer={latestAnswer}
          timerData={timerData} remainingTime={remainingTime}
          players={players} loading={loading}
          onDrawClue={drawNextClue} onTogglePause={togglePause} onEndRoom={handleEndRoom}
        />
      )}
    </div>
  );
}

export default App;
