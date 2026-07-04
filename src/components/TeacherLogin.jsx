import React from 'react';

export function TeacherLogin({ teacherPhone, setTeacherPhone, onLogin, onBack, loading }) {
  return (
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
        <button className="btn-luxury mt-4" onClick={onLogin} disabled={loading}>
          <span className="btn-text-main">{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</span>
        </button>
        <button className="btn-back" onClick={onBack} disabled={loading}>กลับสู่หน้าหลัก</button>
      </div>
    </div>
  );
}
