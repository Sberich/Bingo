import React from 'react';

export function StudentJoin({ roomCode, setRoomCode, playerName, setPlayerName, onJoin, onBack, loading }) {
  return (
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
        <button className="btn-luxury mt-4" onClick={onJoin} disabled={loading}>
          <span className="btn-text-main">
            {loading && <span className="spinner"></span>}
            {loading ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่สนามสอบ'}
          </span>
        </button>
        <button className="btn-back" onClick={onBack} disabled={loading}>กลับสู่หน้าหลัก</button>
      </div>
    </div>
  );
}
