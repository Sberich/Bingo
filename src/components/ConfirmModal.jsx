import React from 'react';

export function ConfirmModal({ show, onConfirm, onCancel }) {
  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`}>
      <div className="modal-content glass-panel">
        <h2 className="section-title">ประกาศชัยชนะ</h2>
        <div className="gold-divider-small"></div>
        <p className="description">คุณตรวจสอบความถูกต้องของกระดานแล้ว และต้องการประกาศ BINGO ใช่หรือไม่?</p>
        <div className="modal-actions mt-4">
          <button className="btn-luxury" onClick={onConfirm}>
            <span className="btn-text-main">ยืนยัน BINGO</span>
          </button>
          <button className="btn-luxury-outline" onClick={onCancel}>
            <span className="btn-text-main">ยกเลิก</span>
          </button>
        </div>
      </div>
    </div>
  );
}
