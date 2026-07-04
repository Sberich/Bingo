import { useEffect } from 'react';

export function useRoomPolling({
  roomCode,
  inGame,
  scriptUrl,
  setPlayers,
  setCurrentClues,
  setLatestClueText,
  setTimerData,
  resetGame,
  showToast
}) {
  useEffect(() => {
    let interval = null;

    const fetchRoomStatus = async () => {
      if (!roomCode || !inGame) return;
      try {
        const res = await fetch(`${scriptUrl}?action=getRoomStatus&roomCode=${encodeURIComponent(roomCode)}`);
        if (!res.ok) {
          console.error('Network response was not ok');
          return;
        }
        const data = await res.json();
        
        if (data.status === 'success') {
          if (data.roomStatus === 'ended') {
             showToast('ครูปิดห้องเรียนแล้ว', 'info');
             resetGame();
             return;
          }
          setPlayers(data.players || []);
          if (data.clues) {
              setCurrentClues(data.clues);
              if(data.clues.length > 0) {
                  setLatestClueText(data.clues[data.clues.length - 1]);
              }
          }
          if (data.timerData) {
              setTimerData(data.timerData);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    if (inGame && roomCode) {
      fetchRoomStatus(); // Initial fetch
      interval = setInterval(fetchRoomStatus, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inGame, roomCode, scriptUrl, setPlayers, setCurrentClues, setLatestClueText, setTimerData, resetGame, showToast]);
}
