import React from 'react';

export function StudentGame({ 
  playerName, roomCode, latestClueText, timerData, remainingTime, 
  card, marked, toggleMark, loading, onBingo 
}) {
  return (
    <div className="glass-panel wide-panel">
      <div className="top-bar">
        <span>👤 {playerName}</span>
        <span className="room-badge">รหัสห้อง: {roomCode}</span>
      </div>
      
      <div className="clue-display student-clue">
        <h4>คำใบ้ล่าสุดจากห้องเรียน:</h4>
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
        <span className="btn-text-main">BINGO!</span>
      </button>
    </div>
  );
}
