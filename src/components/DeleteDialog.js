import React from 'react';

const DeleteDialog = ({ openOrNot, label, onCancelClick, onOKClick, deleteLoading }) => {
  if (!openOrNot) return null; // Don't render the dialog if it's not open

  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '5px',
          width: '400px',
          textAlign: 'center',
        }}
      >
        <h2>{label}</h2>
        <div style={{ marginTop: '20px' }}>
          <button
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              border: '1px solid gray',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
            onClick={onCancelClick}
          >
            Cancel
          </button>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'red',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={onOKClick}
          >
            {deleteLoading ? (
              <span
                style={{
                  display: 'inline-block',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #555',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  animation: 'spin 1s linear infinite',
                }}
              ></span>
            ) : (
              'Yes! Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;

// Adding keyframes for spinner animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);
