import React from 'react';

export function Toast({ toast }) {
  return (
    <div className={`toast-notification ${toast.show ? 'show' : ''} ${toast.type}`}>
      <div className="toast-icon">
        {toast.type === 'success' ? '✧' : toast.type === 'error' ? '⚠' : 'ℹ'}
      </div>
      <div className="toast-message">{toast.message}</div>
    </div>
  );
}
