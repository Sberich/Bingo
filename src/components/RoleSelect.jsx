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
            color: 'var(--color-gold-light)',
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
  );
}
