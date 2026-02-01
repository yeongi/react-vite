import { STAGE, IPlayer, TETROMINO_TYPE, TETROMINOS, STAGE_WIDTH, createStage, checkCollision, generateBag } from '../gameHelpers';
import { SoundManager } from './SoundManager';

// SRS Wall Kick Data
const SRS_KICKS_JLS_T_Z = {
  '0-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1-0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1-2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3-2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3-0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

const SRS_KICKS_I = {
  '0-1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1-0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1-2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2-1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2-3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3-2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3-0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0-3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

export interface GameState {
  stage: STAGE;
  score: number;
  rows: number;
  level: number;
  gameOver: boolean;
  dropTime: number | null;
  nextPiece: TETROMINO_TYPE | 0;
  hold: TETROMINO_TYPE | null;
  won: boolean;
}

export class TetrisGame {
  private stage: STAGE;
  private player: IPlayer;
  private bag: TETROMINO_TYPE[];
  private nextPiece: TETROMINO_TYPE;
  private hold: TETROMINO_TYPE | null;
  private holdUsed: boolean;
  private floorSpinCount: number;
  private soundManager: SoundManager;
  
  // Game Status
  private score: number;
  private rows: number; // This tracks rows for level, but we can use it for total too or add totalRows
  private totalRows: number;
  private level: number;
  private gameOver: boolean;
  private won: boolean;
  private dropTime: number | null;

  constructor() {
    // Initial State
    this.stage = createStage();
    this.bag = [];
    this.hold = null;
    this.holdUsed = false;
    this.floorSpinCount = 0;
    this.score = 0;
    this.rows = 0;
    this.totalRows = 0;
    this.level = 0;
    this.gameOver = false;
    this.won = false;
    this.dropTime = null;
    this.soundManager = new SoundManager();

    // Initialize Bag and Player
    this.nextPiece = this.popFromBag(); // Provisional
    this.player = {
      pos: { x: 0, y: 0 },
      tetromino: TETROMINOS[0].shape,
      collided: false,
      rotation: 0
    };
  }

  // --- Helper Methods ---

  private popFromBag(): TETROMINO_TYPE {
    if (this.bag.length === 0) {
      this.bag = generateBag() as TETROMINO_TYPE[];
    }
    return this.bag.pop() as TETROMINO_TYPE;
  }

  private rotateMatrix(matrix: (TETROMINO_TYPE | 0)[][], dir: number) {
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    if (dir > 0) return rotatedTetro.map(row => row.reverse());
    return rotatedTetro.reverse();
  }

  // --- Core Game Logic ---

  public start() {
    this.soundManager.resume();
    this.stage = createStage();
    this.bag = [];
    this.hold = null;
    this.holdUsed = false;
    this.score = 0;
    this.rows = 0;
    this.totalRows = 0;
    this.level = 0;
    this.gameOver = false;
    this.won = false;
    this.dropTime = 1000;
    this.floorSpinCount = 0;

    // Initialize pieces
    const current = this.popFromBag();
    this.nextPiece = this.popFromBag();
    
    this.player = {
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: TETROMINOS[current].shape,
      collided: false,
      rotation: 0,
    };
  }

  public move(dir: number) {
    this.soundManager.resume();
    if (this.gameOver) return;
    if (!checkCollision(this.player, this.stage, { x: dir, y: 0 })) {
      this.player.pos.x += dir;
    }
  }

  public drop() {
    if (this.gameOver) return;

    // Level up logic
    if (this.rows > (this.level + 1) * 10) {
      this.level += 1;
      this.dropTime = 1000 / (this.level + 1) + 200;
    }

    if (!checkCollision(this.player, this.stage, { x: 0, y: 1 })) {
      this.player.pos.y += 1;
      this.floorSpinCount = 0; // Reset floor spin count on drop
    } else {
      // Game Over check
      if (this.player.pos.y < 1) {
        this.gameOver = true;
        this.dropTime = null;
        this.soundManager.playGameOver();
      }
      // Lock piece
      this.player.collided = true;
      this.updateStage();
    }
  }

  public hardDrop() {
    this.soundManager.resume();
    if (this.gameOver) return;
    let tmpY = 0;
    while (!checkCollision(this.player, this.stage, { x: 0, y: tmpY + 1 })) {
      tmpY += 1;
    }
    this.player.pos.y += tmpY;
    this.player.collided = true;
    this.updateStage();
  }

  public rotate(dir: number) {
    this.soundManager.resume();
    if (this.gameOver) return;

    // Floor spin limit
    const isOnFloor = checkCollision(this.player, this.stage, { x: 0, y: 1 });
    if (isOnFloor) {
      if (this.floorSpinCount >= 10) return;
      this.floorSpinCount += 1;
    } else {
      this.floorSpinCount = 0;
    }

    const clonedPlayer = JSON.parse(JSON.stringify(this.player)) as IPlayer;
    const oldRotation = clonedPlayer.rotation;
    const newRotation = (oldRotation + (dir > 0 ? 1 : 3)) % 4;

    clonedPlayer.tetromino = this.rotateMatrix(clonedPlayer.tetromino, dir);
    clonedPlayer.rotation = newRotation;

    // Determine kick table
    const type = clonedPlayer.tetromino.flat().find(cell => cell !== 0);
    if (type === 'O') return; // O piece doesn't rotate effectively (or kicks)

    const kicks = type === 'I' ? SRS_KICKS_I : SRS_KICKS_JLS_T_Z;
    const kickKey = `${oldRotation}-${newRotation}` as keyof typeof kicks;
    const activeKicks = kicks[kickKey];

    if (activeKicks) {
      for (const [kx, ky] of activeKicks) {
         // SRS y is positive upwards, game is positive downwards
        if (!checkCollision(clonedPlayer, this.stage, { x: kx, y: -ky })) {
          clonedPlayer.pos.x += kx;
          clonedPlayer.pos.y -= ky;
          this.player = clonedPlayer;
          return;
        }
      }
    }
  }

  public holdPiece() {
    this.soundManager.resume();
    if (this.gameOver || this.holdUsed) return;

    const currentType = this.player.tetromino.flat().find(cell => cell !== 0) as TETROMINO_TYPE | undefined;
    if (!currentType) return;

    if (!this.hold) {
      this.hold = currentType;
      this.spawnPiece();
    } else {
      const temp = this.hold;
      this.hold = currentType;
      this.player = {
        pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
        tetromino: TETROMINOS[temp].shape,
        collided: false,
        rotation: 0
      };
    }
    this.holdUsed = true;
  }

  public setDropTime(time: number | null) {
      this.dropTime = time;
  }

  public setGameOver(won: boolean) {
      this.gameOver = true;
      this.won = won;
      this.dropTime = null;
  }

  // --- Internal Logic ---

  private spawnPiece() {
      const current = this.nextPiece;
      this.nextPiece = this.popFromBag();
      
      this.player = {
          pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
          tetromino: TETROMINOS[current].shape,
          collided: false,
          rotation: 0
      };
      this.holdUsed = false;
      this.floorSpinCount = 0;

      // Immediate Game Over check on spawn
      if (checkCollision(this.player, this.stage, { x: 0, y: 0 })) {
          this.gameOver = true;
          this.dropTime = null;
          this.soundManager.playGameOver();
      }
  }

  private updateStage() {
      // 1. Lock the piece into the stage
      const newStage = this.stage.map(row => 
        row.map(cell => (cell[1] === 'merged' ? cell : [0, 'clear']))
      ) as STAGE;

      this.player.tetromino.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value !== 0) {
                  const targetY = y + this.player.pos.y;
                  const targetX = x + this.player.pos.x;
                  if (newStage[targetY] && newStage[targetY][targetX]) {
                     newStage[targetY][targetX] = [value, 'merged'];
                  }
              }
          });
      });

      this.stage = newStage;
      this.soundManager.playDrop();

      // 2. Sweep Rows
      let rowsCleared = 0;
      this.stage = this.stage.reduce((ack, row) => {
        if (row.findIndex(cell => cell[0] === 0) === -1) {
          rowsCleared++;
          ack.unshift(new Array(newStage[0].length).fill([0, 'clear']) as any);
          return ack;
        }
        ack.push(row);
        return ack;
      }, [] as STAGE);

      // 3. Update Score and Play Sound
      if (rowsCleared > 0) {
        this.soundManager.playClear(rowsCleared);
        const linePoints = [40, 100, 300, 1200];
        const points = linePoints[rowsCleared - 1] || 0; // Safeguard
        this.score += points * (this.level + 1);
        this.rows += rowsCleared;
        this.totalRows += rowsCleared;
        this.level += rowsCleared;

        if (this.totalRows >= 20) {
            this.won = true;
            this.gameOver = true;
            this.dropTime = null;
            // Optionally play win sound
        }
      }

      // 4. Spawn Next
      if (!this.gameOver) {
         this.spawnPiece();
      }
  }

  // --- Public State Accessor ---

  public getState(): GameState {
    // Generate 'Rendered' Stage (Merged + Active + Ghost)
    // Deep copy current stage
    const renderStage = this.stage.map(row => row.map(cell => [...cell])) as STAGE;

    if (!this.gameOver && this.player.tetromino) { // Check player exists
        // Draw Ghost
        let ghostY = 0;
        while (ghostY < renderStage.length && !checkCollision(this.player, renderStage, { x: 0, y: ghostY + 1 })) {
          ghostY += 1;
        }

        this.player.tetromino.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const targetY = y + this.player.pos.y + ghostY;
                    const targetX = x + this.player.pos.x;
                    if (renderStage[targetY] && renderStage[targetY][targetX] && renderStage[targetY][targetX][1] === 'clear') {
                        renderStage[targetY][targetX] = [value, 'ghost'];
                    }
                }
            });
        });

        // Draw Active Piece
        this.player.tetromino.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                     const targetY = y + this.player.pos.y;
                     const targetX = x + this.player.pos.x;
                     if (renderStage[targetY] && renderStage[targetY][targetX]) {
                         renderStage[targetY][targetX] = [value, 'clear']; // Or just value?
                         // In original 'useStage', it was: [value, `${player.collided ? 'merged' : 'clear'}`]
                         // Here, we know it's active (not collided/merged yet because updateStage handles merge).
                         // So it is 'clear' status but with color.
                         // Wait, if I set 'clear', it might be swept? No, this is renderStage.
                         // The cell status is usually 'clear', 'merged', 'ghost'.
                         renderStage[targetY][targetX] = [value, 'clear'];
                     }
                }
            });
        });
    }

    return {
        stage: renderStage,
        score: this.score,
        rows: this.rows,
        level: this.level,
        gameOver: this.gameOver,
        dropTime: this.dropTime,
        nextPiece: this.nextPiece,
        hold: this.hold,
        won: this.won
    };
  }
}
