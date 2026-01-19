
import { useGameStore } from './stores/gameStore';
import { GameState } from './data/gameConfig';
import TitleScreen from './components/TitleScreen';
import Game from './components/Game';
import './App.css';

function App() {
  const gameState = useGameStore((state) => state.gameState);
  
  return (
    <div className="app">
      {/* タイトル画面 */}
      {gameState === GameState.TITLE && <TitleScreen />}
      
      {/* ゲーム画面 */}
      {(gameState === GameState.PLAYING ||
        gameState === GameState.DIALOGUE ||
        gameState === GameState.PAUSED ||
        gameState === GameState.GAME_OVER) && (
        <Game />
      )}
    </div>
  );
}

export default App;
