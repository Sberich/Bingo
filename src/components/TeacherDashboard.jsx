import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export function TeacherDashboard({ 
  roomCode, teacherName, timeLimit, setTimeLimit, latestClueText, latestAnswer,
  currentClues, timerData, remainingTime, players, loading, 
  onDrawClue, onTogglePause, onEndRoom 
}) {
  const confettiFired = useRef(false);

  useEffect(() => {
    const hasWinner = players.some(p => p.isBingo);
    if (hasWinner && !confettiFired.current) {
      confettiFired.current = true;
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
    }
  }, [players]);

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isBingo && !b.isBingo) return -1;
    if (!a.isBingo && b.isBingo) return 1;
    if (a.isBingo && b.isBingo) {
      // Both have bingo, sort by timestamp if available (ascending)
      if (typeof a.isBingo === 'number' && typeof b.isBingo === 'number') {
        return a.isBingo - b.isBingo;
      }
    }
    return (b.score || 0) - (a.score || 0);
  });

  // Calculate bingo ranks
  let currentRank = 1;
  sortedPlayers.forEach(p => {
    if (p.isBingo) {
      p.rank = currentRank++;
    }
  });

  return (
    <div className="glass-panel wide-panel">
      <div className="teacher-dashboard">
        <div className="dashboard-left">
          <h2 className="room-code-large">รหัสห้อง: <span>{roomCode}</span></h2>
          <p style={{color: 'var(--color-gold-light)', marginTop: '0.5rem', marginBottom: '1.5rem', opacity: 0.8}}>ผู้ควบคุม: ครู{teacherName}</p>
          <div className="gold-divider-small" style={{ margin: '0 0 1.5rem 0' }}></div>
          
          <div className="clue-display">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--color-gold)' }}>สุ่มคำถาม {currentClues && currentClues.length > 0 && `(ข้อที่ ${currentClues.length})`}</h4>
              <div className="input-wrapper" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ margin: 0 }}>เวลา (วิ)</label>
                <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} min="10" style={{ width: '80px', padding: '0.5rem', fontSize: '1em' }} />
              </div>
            </div>

            <div className="clue-box large animated-reveal" style={{ borderLeft: 'none', textAlign: 'center', minHeight: '120px' }}>
              {latestClueText ? latestClueText : <span style={{ opacity: 0.5 }}>ยังไม่ได้เริ่มสุ่ม</span>}
            </div>
            {latestAnswer && (
              <div className="answer-box" style={{ textAlign: 'center' }}>เฉลย: {latestAnswer}</div>
            )}
            
            {timerData && (
              <div className="timer-container mt-4">
                <div className="timer-bar" style={{ width: `${(remainingTime / timerData.duration) * 100}%`, backgroundColor: remainingTime <= 5 ? '#ff4d4f' : 'var(--color-gold)' }}></div>
                <div className="timer-text" style={{ color: remainingTime <= 5 ? '#ff4d4f' : 'var(--color-gold-light)' }}>
                  {timerData.isPaused ? 'หยุดเวลาชั่วคราว' : remainingTime > 0 ? `เหลือเวลา ${remainingTime} วินาที` : 'หมดเวลา'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexDirection: 'column' }}>
              <button className="btn-luxury" onClick={onDrawClue} disabled={loading}>
                <span className="btn-text-main">
                  {loading && <span className="spinner"></span>}
                  {loading ? 'กำลังสุ่ม...' : 'สุ่มคำใบ้ต่อไป'}
                </span>
              </button>
              {timerData && (
                 <button className="btn-luxury-outline" onClick={onTogglePause} disabled={loading}>
                   <span className="btn-text-main">{timerData.isPaused ? '▶ เล่นต่อ' : '⏸ หยุดเวลา'}</span>
                 </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-right">
          <h3 style={{ marginTop: 0, color: 'var(--color-gold-light)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>ผู้เข้าร่วมสอบ ({players.length})</h3>
          <div className="player-list">
            {sortedPlayers.length === 0 ? <p className="description text-muted">รอผู้เล่นเข้าร่วม...</p> : null}
            {sortedPlayers.map((p, i) => (
              <div key={i} className={`player-item ${p.isBingo ? 'winner' : ''}`}>
                <span className="player-name">
                  {p.name}
                  {p.score > 0 && !p.isBingo && <span style={{ fontSize: '0.8em', color: 'var(--color-gold)', marginLeft: '8px' }}>({p.score}/24)</span>}
                </span>
                {p.isBingo && <span className="bingo-tag">BINGO! ลำดับ {p.rank} 🎉</span>}
              </div>
            ))}
          </div>
          
          <button 
            className="btn-back mt-4" 
            style={{ display: 'block', textAlign: 'center', width: '100%', color: '#ef9a9a', marginTop: '3rem' }} 
            onClick={onEndRoom}
          >
            ปิดห้องเรียน (จบเกม)
          </button>
        </div>
      </div>
    </div>
  );
}
