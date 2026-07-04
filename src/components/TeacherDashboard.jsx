import React from 'react';

export function TeacherDashboard({ 
  roomCode, teacherName, timeLimit, setTimeLimit, latestClueText, latestAnswer,
  timerData, remainingTime, players, loading, 
  onDrawClue, onTogglePause, onEndRoom 
}) {
  return (
    <div className="glass-panel wide-panel">
      <div className="teacher-dashboard">
        <div className="dashboard-left">
          <h2 className="room-code-large">รหัสห้อง: <span>{roomCode}</span></h2>
          <div className="gold-divider-small" style={{margin: '1rem 0'}}></div>
          <p style={{color: 'var(--color-gold-light)', marginBottom: '1.5rem'}}>ผู้ควบคุมการทดสอบ: ครู{teacherName}</p>
          
          <div className="clue-display">
            <h4>สุ่มคำถาม:</h4>
            <div className="input-wrapper" style={{ marginBottom: '1rem', width: '200px' }}>
              <label>เวลาให้ตอบ (วินาที)</label>
              <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} min="10" />
            </div>
            <div className="clue-box large animated-reveal">
              {latestClueText ? latestClueText : 'ยังไม่ได้เริ่มสุ่ม'}
            </div>
            {latestAnswer && (
              <div className="answer-box">เฉลย: {latestAnswer}</div>
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
              <button className="btn-luxury" onClick={onDrawClue} disabled={loading} style={{ flex: 2 }}>
                <span className="btn-text-main">{loading ? 'กำลังสุ่ม...' : 'สุ่มคำใบ้ต่อไป'}</span>
              </button>
              {timerData && (
                <button className="btn-luxury-outline" onClick={onTogglePause} disabled={loading} style={{ flex: 1 }}>
                  <span className="btn-text-main">{timerData.isPaused ? '▶ เล่นต่อ' : '⏸ หยุดเวลา'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-right">
          <h3>ผู้เข้าร่วมสอบ ({players.length})</h3>
          <div className="player-list">
            {players.length === 0 ? <p className="description text-muted">รอผู้เล่นเข้าร่วม...</p> : null}
            {players.map((p, i) => (
              <div key={i} className={`player-item ${p.isBingo ? 'winner' : ''}`}>
                <span className="player-name">{p.name}</span>
                {p.isBingo && <span className="bingo-tag">BINGO! 🎉</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="btn-back mt-4" style={{display:'block', textAlign:'center', width:'100%'}} onClick={onEndRoom}>ปิดห้องเรียน (จบเกม)</button>
    </div>
  );
}
