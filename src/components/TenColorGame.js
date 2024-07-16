import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import config from '../config';

const TenColorGame = () => {
  const { baseURL } = config;
  const [gameDetails, setGameDetails] = useState(null);
  const [error, setError] = useState(null);
  const [countdownDisplay, setCountdownDisplay] = useState('');
  const [autoResult, setAutoResult] = useState(true); // State to toggle auto/manual result setting
  const [selectedWinner, setSelectedWinner] = useState(null); // State to store the selected winner
  const [isToggleActive, setIsToggleActive] = useState(false); // State to track toggle button activation

  // Colors ordered with Color1 first
  const colors = [
    "#9C27B0", // Purple
    "#E91E63", // Pink
    "#3F51B5", // Indigo
    "#6750A4", // Blue
    "#FF5722", // Deep Orange
    "#00BCD4", // Cyan
    "#03ff63", // Green
    "#B295FF", // Yellow
    "#FF9800", // Orange
    "#03A9F4" // Light Blue
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(new Error('Token not found'));
      return;
    }

    const fetchGameDetails = () => {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      fetch(`${baseURL}/admin/ongoing-game-details`, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(result => {
          if (!Array.isArray(result)) {
            throw new Error('API response is not an array');
          }
          const filteredDetails = result.find(game => game.mode === "tenColors");
          setGameDetails(filteredDetails);
          if (filteredDetails) {
            setCountdownDisplay(formatCountdown(filteredDetails.countdown));
            setIsToggleActive(filteredDetails.countdown <= 30); // Activate toggle button in the last 30 seconds
          }
        })
        .catch(error => setError(error));
    };

    fetchGameDetails(); // Initial fetch

    const interval = setInterval(fetchGameDetails, 1000); // Refresh every second

    return () => clearInterval(interval); // Cleanup interval on unmount or re-render
  }, []);

  useEffect(() => {
    // Auto-update current winner display
    const interval = setInterval(() => {
      if (gameDetails) {
        setCountdownDisplay(formatCountdown(gameDetails.countdown));
        setIsToggleActive(gameDetails.countdown <= 30);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameDetails]);

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  const handleToggleResultSetting = () => {
    if (isToggleActive) {
      setAutoResult(!autoResult);
    }
  };

  const handleSetWinner = (color) => {
    if (!autoResult) {
      setSelectedWinner(color);
      const token = localStorage.getItem('token');
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ gameId: gameDetails.gameId, winner: color }),
        redirect: "follow"
      };

      fetch(`${baseURL}/api/masteruser/admin/set-winner`, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to set winner');
          }
          return response.json();
        })
        .then(result => {
          console.log('Winner set successfully', result);
        })
        .catch(error => setError(error));
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!gameDetails) {
    return (
      <div className="bg-gray-800 text-white p-6 rounded-lg max-w-2xl mx-auto my-6 flex justify-center items-center">
        Loading...
        <div className="animate-spin text-5xl">
          ⏳
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg max-w-2xl mx-auto my-6">
      <h2 className="text-xl"><strong>Current Winner: {gameDetails.winnerColor}</strong></h2>
      <div className="flex justify-between mb-2 mt-4">
        <h2 className="text-xl"><strong>Game ID: {gameDetails.gameId}</strong></h2>
        <h2 className="text-xl"><strong>Countdown: {countdownDisplay}</strong></h2>
        <button
          onClick={handleToggleResultSetting}
          className={`px-4 py-2 ${isToggleActive ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded-full`}
          disabled={!isToggleActive}
        >
          Switch to {autoResult ? 'Manual' : 'Automatic'}
        </button>
      </div>
      <table className="min-w-full bg-gray-700 mb-4 mt-8">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Color</th>
            <th className="py-2 px-4 border-b">Total Bet Users</th>
            <th className="py-2 px-4 border-b">Total Bet Amount</th>
            <th className="py-2 px-4 border-b">After Calculation Bet Amount</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {colors.map((color, idx) => {
            const detail = gameDetails.details.find(d => d.color === `Color${idx}`) || {};
            const textColor = color === "#FFFFFF" ? "black" : "white";
            const isActionDisabled = autoResult; // Disable if in automatic mode

            const totalBetAmount = detail.clients
              ? detail.clients.reduce((acc, client) => acc + client.betAmount, 0)
              : 0;

            return (
              <tr key={idx}>
                <td className="py-2 px-4 border-b" style={{ backgroundColor: color, color: textColor }}>{`Color${idx}`}</td>
                <td className="py-2 px-4 border-b">{detail.totalUsers || 0}</td>
                <td className="py-2 px-4 border-b">{totalBetAmount.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{detail.totalFinalAmount || 0}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleSetWinner(`Color${idx}`)}
                    className={`px-4 py-2 rounded-full ${color === "#000000" ? "text-white" : "text-black"}`}
                    style={{
                      backgroundColor: isActionDisabled ? "red" : color,
                      color: isActionDisabled ? "white" : (color === "#000000" ? "white" : "black")
                    }}
                    disabled={isActionDisabled}
                  >
                    {selectedWinner === `Color${idx}` ? 'Selected' : 'Set Winner'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TenColorGame;
