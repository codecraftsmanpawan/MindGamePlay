import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSurprise } from 'react-icons/fa';
import TopNavBar from './NavBar';
import BottomNavBar from './BottomNavBar';
import Modal from './Modal';
import config from '../config';

const OngoingGamesComponent = () => {
  const navigate = useNavigate();
  const { baseURL } = config;
  const [ongoingGames, setOngoingGames] = useState([]);
  const [completedGames, setCompletedGames] = useState([]);
  const [error, setError] = useState(null);
  const [newGameCountdown, setNewGameCountdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameResults, setGameResults] = useState({});
  const [selectedGameDetails, setSelectedGameDetails] = useState({
    gameId: '',
    gameMode: '',
    selectedColor: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchGameResults();
  }, []);

  useEffect(() => {
    fetchOngoingGames();
    const fetchInterval = setInterval(fetchOngoingGames, 1000);
    return () => clearInterval(fetchInterval);
  }, []);

  const fetchGameResults = () => {
    fetch(`${baseURL}/admin/last-game-results`)
      .then((response) => response.json())
      .then((result) => {
        setGameResults(result);
        if (result.blackWhite) {
          handleCompletedGame('blackWhite', result.blackWhite.results);
        }
        if (result.tenColors) {
          handleCompletedGame('tenColors', result.tenColors.results);
        }
      })
      .catch((error) => console.error('Error:', error));
  };

  const fetchOngoingGames = () => {
    fetch(`${baseURL}/api/games/ongoing`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          const sortedGames = data.data.sort((a, b) => {
            if (a.mode === 'blackWhite') return -1;
            if (a.mode === 'tenColors' && b.mode !== 'blackWhite') return -1;
            return 1;
          });
          setOngoingGames(sortedGames.map(game => ({
            ...game,
            countdown: calculateCountdown(game.endTime)
          })));
        } else {
          setError('Failed to fetch ongoing games');
        }
      })
      .catch((error) => {
        console.error('Error fetching ongoing games:', error);
        setError('Failed to fetch ongoing games');
      });
  };

  const calculateCountdown = (endTime) => {
    const endTimestamp = new Date(endTime).getTime();
    const now = new Date().getTime();
    const difference = endTimestamp - now;

    if (difference < 0) {
      return "00:00";
    }

    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setOngoingGames(prevGames => (
        prevGames.map(game => {
          const newCountdown = calculateCountdown(game.endTime);
          if (newCountdown === "00:00") {
            setNewGameCountdown(20);
          }
          return {
            ...game,
            countdown: newCountdown
          };
        })
      ));
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    if (newGameCountdown !== null) {
      if (newGameCountdown === 0) {
        fetchOngoingGames();
        setNewGameCountdown(null);
      } else {
        const timeout = setTimeout(() => {
          setNewGameCountdown(newGameCountdown - 1);
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [newGameCountdown]);

  useEffect(() => {
    const gameWithZeroCountdown = ongoingGames.find(game => game.countdown === "00:00");
    if (gameWithZeroCountdown) {
      setNewGameCountdown(20);
    }
  }, [ongoingGames]);

  const colors = [
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#3F51B5", // Indigo
    "#6750A4", // Blue
    "#FF5722", // Deep Orange
    "#00BCD4", // Cyan
    "#03ff63", // Green
    "#B295FF", // Yellow
    "#FF9800", // Orange
    "#03A9F4"  // Light Blue
  ];

  const handleButtonClick = (gameId, gameMode, selectedColor, isDisabled) => {
    if (isDisabled) {
      alert('Time Out');
      return;
    }
    setSelectedGameDetails({ gameId, gameMode, selectedColor });
    setIsModalOpen(true);
  };

  const handleCompletedGame = (mode, results) => {
    setCompletedGames(prevGames => [
      ...prevGames,
      { mode, results }
    ]);
    setTimeout(() => {
      setCompletedGames(prevGames => prevGames.filter(game => game.mode !== mode));
    }, 5000);
  };

  const renderGamesByMode = (mode) => {
    const games = ongoingGames.filter(game => game.mode === mode);

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 ml-4">{mode === 'blackWhite' ? 'Black & White Games' : 'Ten Colors Games'}</h2>
        {games.length === 0 || games.every(game => game.countdown === "00:00") ? (
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-lg font-semibold">New {mode === 'blackWhite' ? 'Black & White' : 'Ten Colors'} game starts soon...</p>
            {newGameCountdown !== null && (
              <p className="text-lg font-semibold">Starting in: {newGameCountdown} seconds</p>
            )}
            {completedGames.find(game => game.mode === mode) && (
              <div className="animate__animated animate__bounceIn text-center mt-6">
                <p className="text-lg font-semibold">Game Results:</p>
                <div className="flex items-center justify-center">
                  <p className="mr-2 text-2xl">{completedGames.find(game => game.mode === mode).results}</p>
                  <FaSurprise className={`text-2xl animate__animated animate__heartBeat ${mode === 'blackWhite' ? 'text-pink-500' : 'text-yellow-500'}`} />
                </div>
              </div>
            )}
          </div>
        ) : (
          games.map((game) => {
            const isDisabled = game.countdown.split(':').reduce((min, sec) => (parseInt(min) * 60) + parseInt(sec)) <= 30;
            return (
              <div key={game.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Game ID: {game.gameId}</p>
                  <p className="text-lg font-semibold">Countdown: {game.countdown}</p>
                </div>
                <div className="mt-4 flex justify-center">
                  {game.mode === 'blackWhite' ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleButtonClick(game._id, game.mode, 'Black', isDisabled)}
                          disabled={isDisabled}
                          className={`py-3 px-14 rounded shadow transition duration-200 ${isDisabled ? 'bg-gray-500' : 'bg-black text-white hover:bg-gray-800'}`}
                        >
                          Black
                        </button>
                        <button
                          onClick={() => handleButtonClick(game._id, game.mode, 'White', isDisabled)}
                          disabled={isDisabled}
                          className={`py-3 px-14 rounded shadow transition duration-200 ${isDisabled ? 'bg-gray-300' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                          White
                        </button>
                      </div>
                      <p><strong>Note:</strong> Win Bet Amount * 1.9</p>
                    </div>
                  ) : game.mode === 'tenColors' ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="grid grid-cols-5 gap-4">
                        {colors.map((color, index) => (
                          <button
                            key={index}
                            style={{ backgroundColor: color }}
                            onClick={() => handleButtonClick(game._id, game.mode, `Color${index}`, isDisabled)}
                            disabled={isDisabled}
                            className={`relative text-white py-3 px-6 rounded-full shadow-lg transition duration-200 transform ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:translate-y-1 hover:shadow-2xl'}`}
                          >
                            <span className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20 rounded-full pointer-events-none"></span>
                            {index}
                          </button>
                        ))}
                      </div>
                      <p><strong>Note:</strong> Win Bet Amount * 9</p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div>
      <TopNavBar />
      <div className="container mx-auto py-8 mt-12">
        {error && <p className="text-red-500">Error: {error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderGamesByMode('blackWhite')}
          {renderGamesByMode('tenColors')}
        </div>
      </div>
      <BottomNavBar />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gameId={selectedGameDetails.gameId}
        gameMode={selectedGameDetails.gameMode}
        selectedColor={selectedGameDetails.selectedColor}
      />
    </div>
  );
};

export default OngoingGamesComponent;
