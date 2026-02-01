import { io, Socket } from 'socket.io-client';
import { GameState } from './TetrisGame';

// Determine URL: Use env var if set, otherwise use relative path in Prod (same origin), or localhost in Dev.
const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? '/' : 'http://localhost:3001');

export class SocketManager {
  private socket: Socket | null = null;
  private onStartCallback: ((room: string) => void) | null = null;
  private onOpponentStateCallback: ((state: any) => void) | null = null;
  private onGameOverWinCallback: (() => void) | null = null;
  private onGameOverLoseCallback: (() => void) | null = null;
  private onWaitingCallback: (() => void) | null = null;

  constructor() {
    // Lazy connection
  }

  public connect() {
      if (this.socket) return;
      this.socket = io(SERVER_URL);
      this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket?.id);
    });

    this.socket.on('waiting_for_opponent', () => {
      console.log('Waiting for opponent...');
      if (this.onWaitingCallback) this.onWaitingCallback();
    });

    this.socket.on('start_game', ({ room }) => {
      console.log('Game started in room:', room);
      if (this.onStartCallback) this.onStartCallback(room);
    });

    this.socket.on('opponent_state', (data: any) => {
      if (this.onOpponentStateCallback) this.onOpponentStateCallback(data);
    });

    this.socket.on('game_over_win', () => {
      if (this.onGameOverWinCallback) this.onGameOverWinCallback();
    });

    this.socket.on('game_over_lose', () => {
      if (this.onGameOverLoseCallback) this.onGameOverLoseCallback();
    });
  }

  public emitState(state: GameState) {
    if (!this.socket) return;
    // Broadcast key game state info
    this.socket.emit('update_state', {
      stage: state.stage, 
      score: state.score,
      rows: state.rows,
      gameOver: state.gameOver
    });
  }

  public emitWin() {
    if (!this.socket) return;
    this.socket.emit('player_won');
  }

  public onStart(callback: (room: string) => void) {
    this.onStartCallback = callback;
  }

  public onOpponentState(callback: (state: any) => void) {
    this.onOpponentStateCallback = callback;
  }

  public onGameOverWin(callback: () => void) {
    this.onGameOverWinCallback = callback;
  }

  public onGameOverLose(callback: () => void) {
    this.onGameOverLoseCallback = callback;
  }

  public onWaiting(callback: () => void) {
    this.onWaitingCallback = callback;
  }

  public disconnect() {
    if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
    }
  }
}
