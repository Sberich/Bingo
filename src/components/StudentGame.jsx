import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

export function StudentGame({ 
  playerName, roomCode, latestClueText, timerData, remainingTime, 
  card, marked, toggleMark, loading, onBingo, players = []
}) {
  const [announcement, setAnnouncement] = useState(null);
  const announcedRef = useRef(new Set());

  useEffect(() => {
    if (!players || players.length === 0) return;

    // หาคนที่ BINGO และยังไม่ได้ถูกประกาศ
    const newBingoPlayers = players.filter(p => p.isBingo && !announcedRef.current.has(p.isBingo));
    
    if (newBingoPlayers.length > 0) {
      // เรียงตามเวลาที่ Bingo (จากน้อยไปมาก) เผื่อมีหลายคนพร้อมกัน
      const sorted = [...newBingoPlayers].sort((a, b) => {
        if (typeof a.isBingo === 'number' && typeof b.isBingo === 'number') return a.isBingo - b.isBingo;
        return 0;
      });
      
      const latestBingo = sorted[0]; // เอาคนแรกสุดที่เจอรอบนี้
      
      // บันทึกว่าประกาศคนนี้ไปแล้ว
      newBingoPlayers.forEach(p => announcedRef.current.add(p.isBingo));

      // ถ้าไม่ใช่ตัวเราเองที่ BINGO (เพราะตัวเรามีพลุขึ้นตอนกดปุ่ม BINGO สำเร็จไปแล้ว)
      if (latestBingo.name !== playerName) {
        setAnnouncement(`${latestBingo.name} BINGO แล้ว! 🎉`);
        
        // จุดพลุฉลองให้เพื่อน
        const duration = 4 * 1000;
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

        // ปิด Popup หลังผ่านไป 4.5 วินาที
        setTimeout(() => {
          setAnnouncement(null);
        }, 4500);
      }
    }
  }, [players, playerName]);

  return (
    <>
      <div className="glass-panel wide-panel" style={{ position: 'relative' }}>
        {announcement && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(20, 20, 20, 0.95)',
            border: '2px solid var(--color-gold)',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
            padding: '2rem',
            borderRadius: '15px',
            zIndex: 9999,
            textAlign: 'center',
            width: '85%',
            maxWidth: '400px',
            animation: 'pulseGlow 1.5s infinite'
          }}>
            <h2 style={{ color: 'var(--color-gold)', margin: 0, fontSize: '1.5rem', lineHeight: '1.4' }}>
              {announcement}
            </h2>
          </div>
        )}

        <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, marginRight: '10px' }}>
            <span style={{ flexShrink: 0, marginRight: '5px' }}>👤</span>
            <span 
              className="player-name-display"
              style={{ 
                display: 'block', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                minWidth: 0,
                width: '100%'
              }}
            >
              {playerName}
            </span>
          </div>
          <span className="room-badge" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            รหัสห้อง: {roomCode}
          </span>
        </div>
        
        <div className="clue-display student-clue">
          <h5 style={{ margin: '0', fontWeight: '400', color: 'var(--color-gold-light)' }}>คำใบ้ล่าสุดจากห้องเรียน:</h5>
          <div className="clue-box animated-reveal">
            {latestClueText ? latestClueText : 'รอคุณครูสุ่มคำใบ้...'}
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

        <button className="btn-luxury bingo-btn" onClick={onBingo} disabled={loading}>
          <span className="btn-text-main">
            {loading && <span className="spinner"></span>}
            {loading ? 'กำลังตรวจสอบ...' : 'BINGO!'}
          </span>
        </button>
      </div>
    </>
  );
}
