import React from 'react';

export function RoleSelect({ setRole }) {
  return (
    <div className="glass-panel">
      <header className="header">
        <h4 className="subtitle">The Legacy of Siam</h4>
        <h1 className="title">Thai History Bingo</h1>
        <div className="gold-divider"></div>
        <p className="description">สัมผัสประสบการณ์แห่งความรู้ผ่านมนต์เสน่ห์แห่งประวัติศาสตร์</p>
      </header>
      
      <div className="role-selection">
        <button className="btn-luxury" onClick={() => setRole('student')}>
          <span className="btn-text-main">เข้าร่วมการทดสอบ</span>
          <span className="btn-text-sub">คลิกที่นี่สำหรับนักเรียน</span>
        </button>
        
        <button 
          className="btn-back"
          onClick={() => setRole('teacher')}
        >
          (ระบบจัดการสำหรับคุณครู)
        </button>
      </div>
    </div>
  );
}
