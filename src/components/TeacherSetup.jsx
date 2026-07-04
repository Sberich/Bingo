import React from 'react';

export function TeacherSetup({ teacherName, startId, setStartId, endId, setEndId, onCreateRoom, onBack, loading }) {
  return (
    <div className="glass-panel">
      <h2 className="section-title">ระบบจัดการห้องเรียน</h2>
      <div className="gold-divider-small"></div>
      <div className="form-group center-content">
        <p className="teacher-desc" style={{ color: 'var(--color-gold-light)' }}>ยินดีต้อนรับ, ครู{teacherName}</p>
        <p className="teacher-desc">กำหนดช่วงข้อสอบสำหรับการสร้างห้อง (ขั้นต่ำ 50 ข้อ)</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <label>ข้อเริ่มต้น (Start)</label>
            <input type="number" value={startId} onChange={e => setStartId(e.target.value)} min="1" placeholder="เช่น 1" />
          </div>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <label>ข้อสิ้นสุด (End)</label>
            <input type="number" value={endId} onChange={e => setEndId(e.target.value)} min="50" placeholder="เช่น 50" />
          </div>
        </div>
        <button className="btn-luxury mt-4" onClick={onCreateRoom} disabled={loading}>
          <span className="btn-text-main">{loading ? 'กำลังสร้างห้อง...' : 'เปิดห้องเรียนใหม่'}</span>
        </button>
        <button className="btn-back" onClick={onBack} disabled={loading}>กลับสู่หน้าหลัก</button>
      </div>
    </div>
  );
}
