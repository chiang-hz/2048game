// 在Node.js環境中導入依賴
if (typeof require !== 'undefined') {
    const Board = require('./Board');
    const MoveProcessor = require('./MoveProcessor');
    global.Board = Board;
    global.MoveProcessor = MoveProcessor;
}

/**
 * GameEngine類 - 遊戲核心邏輯引擎
 * 管理遊戲狀態、處理移動邏輯、檢查勝利/失敗條件
 */
class GameEngine {
    /**
     * 創建新的遊戲引擎
     * @param {number} size - 網格大小，默認為4
     */
    constructor(size = 4) {
        try {
            this.validateSize(size);
            this.size = size;
            this.board = new Board(size);
            this.score = 0;
            this.isWin = false;
            this.isGameOver = false;
            this.moveCount = 0;
            this.previousState = null;
            this.errorCount = 0;
            this.maxErrors = 10; // 最大錯誤次數
            this.lastError = null;
        } catch (error) {
            this.handleError('GameEngine constructor failed', error);
            throw error;
        }
    }

    /**
     * 驗證網格大小
     * @param {number} size - 網格大小
     */
    validateSize(size) {
        if (!Number.isInteger(size) || size < 2 || size > 10) {
            throw new Error(`Invalid grid size: ${size}. Size must be an integer between 2 and 10.`);
        }
    }

    /**
     * 初始化遊戲
     */
    initializeGame() {
        try {
            this.validateGameState();
            this.board.initialize();
            this.score = 0;
            this.isWin = false;
            this.isGameOver = false;
            this.moveCount = 0;
            this.previousState = null;
            this.errorCount = 0;
            this.lastError = null;
            
            // 添加兩個初始方塊
            this.board.addRandomTile();
            this.board.addRandomTile();
            
            // 驗證初始化結果
            this.validateInitialization();
        } catch (error) {
            this.handleError('Game initialization failed', error);
            this.attemptRecovery();
        }
    }

    /**
     * 驗證遊戲狀態
     */
    validateGameState() {
        if (!this.board) {
            throw new Error('Game board is not initialized');
        }
        
        if (typeof this.score !== 'number' || this.score < 0) {
            this.score = 0;
        }
        
        if (typeof this.moveCount !== 'number' || this.moveCount < 0) {
            this.moveCount = 0;
        }
    }

    /**
     * 驗證初始化結果
     */
    validateInitialization() {
        const board = this.board;
        let tileCount = 0;
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const value = board.getCell(row, col);
                if (value !== 0) {
                    tileCount++;
                    if (![2, 4].includes(value)) {
                        throw new Error(`Invalid initial tile value: ${value}`);
                    }
                }
            }
        }
        
        if (tileCount !== 2) {
            throw new Error(`Invalid initial tile count: ${tileCount}. Expected 2.`);
        }
    }

    /**
     * 執行移動操作
     * @param {string} direction - 移動方向 ('left', 'right', 'up', 'down')
     * @returns {boolean} 移動是否成功
     */
    move(direction) {
        try {
            // 驗證輸入
            if (!this.validateDirection(direction)) {
                return false;
            }

            if (this.isGameOver || this.isWin) {
                return false;
            }

            // 驗證遊戲狀態
            this.validateGameState();

            // 保存當前狀態
            this.saveState();

            let result;
            switch (direction) {
                case 'left':
                    result = MoveProcessor.moveLeft(this.board);
                    break;
                case 'right':
                    result = MoveProcessor.moveRight(this.board);
                    break;
                case 'up':
                    result = MoveProcessor.moveUp(this.board);
                    break;
                case 'down':
                    result = MoveProcessor.moveDown(this.board);
                    break;
                default:
                    return false;
            }

            if (result && result.moved) {
                // 驗證移動結果
                this.validateMoveResult(result);
                
                this.score += result.score;
                this.moveCount++;
                
                // 添加新方塊
                this.board.addRandomTile();
                
                // 檢查遊戲狀態
                this.checkWinCondition();
                this.checkGameOverCondition();
                
                return true;
            }

            return false;
        } catch (error) {
            this.handleError(`Move operation failed for direction: ${direction}`, error);
            this.attemptMoveRecovery();
            return false;
        }
    }

    /**
     * 驗證移動方向
     * @param {string} direction - 移動方向
     * @returns {boolean} 方向是否有效
     */
    validateDirection(direction) {
        const validDirections = ['left', 'right', 'up', 'down'];
        return typeof direction === 'string' && validDirections.includes(direction);
    }

    /**
     * 驗證移動結果
     * @param {Object} result - 移動結果
     */
    validateMoveResult(result) {
        if (!result || typeof result !== 'object') {
            throw new Error('Invalid move result object');
        }
        
        if (typeof result.moved !== 'boolean') {
            throw new Error('Invalid move result: missing moved property');
        }
        
        if (typeof result.score !== 'number' || result.score < 0) {
            throw new Error(`Invalid move result score: ${result.score}`);
        }
    }

    /**
     * 檢查是否達到勝利條件
     */
    checkWinCondition() {
        if (this.isWin) return;
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board.getCell(row, col) === 2048) {
                    this.isWin = true;
                    return;
                }
            }
        }
    }

    /**
     * 檢查是否可以向指定方向移動
     * @param {string} direction - 移動方向
     * @returns {boolean} 是否可以移動
     */
    canMove(direction) {
        return MoveProcessor.canMove(this.board, direction);
    }

    /**
     * 檢查遊戲是否結束
     */
    checkGameOverCondition() {
        if (this.isWin) return;
        
        // 如果還有空格，遊戲未結束
        if (!this.board.isFull()) {
            return;
        }
        
        // 檢查是否還能移動
        const directions = ['left', 'right', 'up', 'down'];
        for (const direction of directions) {
            if (MoveProcessor.canMove(this.board, direction)) {
                return;
            }
        }
        
        this.isGameOver = true;
    }

    /**
     * 重新開始遊戲
     */
    restart() {
        this.initializeGame();
    }

    /**
     * 獲取當前分數
     * @returns {number} 當前分數
     */
    getScore() {
        return this.score;
    }

    /**
     * 獲取遊戲板
     * @returns {Board} 遊戲板實例
     */
    getBoard() {
        return this.board;
    }

    /**
     * 檢查遊戲是否結束
     * @returns {boolean} 遊戲是否結束
     */
    isGameOverState() {
        return this.isGameOver;
    }

    /**
     * 檢查是否獲勝
     * @returns {boolean} 是否獲勝
     */
    isWinState() {
        return this.isWin;
    }

    /**
     * 獲取移動次數
     * @returns {number} 移動次數
     */
    getMoveCount() {
        return this.moveCount;
    }

    /**
     * 保存當前遊戲狀態
     */
    saveState() {
        this.previousState = {
            board: this.board.clone(),
            score: this.score,
            isWin: this.isWin,
            isGameOver: this.isGameOver,
            moveCount: this.moveCount
        };
    }

    /**
     * 恢復到上一個狀態
     */
    restoreState() {
        if (this.previousState) {
            this.board = this.previousState.board;
            this.score = this.previousState.score;
            this.isWin = this.previousState.isWin;
            this.isGameOver = this.previousState.isGameOver;
            this.moveCount = this.previousState.moveCount;
        }
    }

    /**
     * 獲取遊戲狀態摘要
     * @returns {Object} 遊戲狀態
     */
    getGameState() {
        try {
            return {
                board: this.board.getGrid(),
                score: this.score,
                isWin: this.isWin,
                isGameOver: this.isGameOver,
                moveCount: this.moveCount,
                errorCount: this.errorCount,
                lastError: this.lastError
            };
        } catch (error) {
            this.handleError('Failed to get game state', error);
            return this.getMinimalGameState();
        }
    }

    /**
     * 獲取最小遊戲狀態（錯誤恢復用）
     * @returns {Object} 最小遊戲狀態
     */
    getMinimalGameState() {
        return {
            board: null,
            score: this.score || 0,
            isWin: false,
            isGameOver: true,
            moveCount: this.moveCount || 0,
            errorCount: this.errorCount || 0,
            lastError: this.lastError
        };
    }

    /**
     * 處理錯誤
     * @param {string} message - 錯誤訊息
     * @param {Error} error - 錯誤對象
     */
    handleError(message, error) {
        this.errorCount++;
        this.lastError = {
            message: message,
            error: error.message || error.toString(),
            timestamp: new Date().toISOString(),
            gameState: {
                score: this.score,
                moveCount: this.moveCount,
                isWin: this.isWin,
                isGameOver: this.isGameOver
            }
        };

        // 記錄錯誤到控制台
        console.error(`GameEngine Error: ${message}`, error);
        
        // 如果錯誤次數過多，強制重置遊戲
        if (this.errorCount >= this.maxErrors) {
            console.warn('Too many errors occurred. Forcing game reset.');
            this.forceReset();
        }
    }

    /**
     * 嘗試恢復遊戲狀態
     */
    attemptRecovery() {
        try {
            console.log('Attempting game recovery...');
            
            // 嘗試重新初始化遊戲板
            if (!this.board || typeof this.board.initialize !== 'function') {
                this.board = new Board(this.size);
            }
            
            // 重新初始化基本狀態
            this.board.initialize();
            this.score = Math.max(0, this.score || 0);
            this.moveCount = Math.max(0, this.moveCount || 0);
            this.isWin = false;
            this.isGameOver = false;
            
            // 添加初始方塊
            this.board.addRandomTile();
            this.board.addRandomTile();
            
            console.log('Game recovery successful');
        } catch (recoveryError) {
            console.error('Game recovery failed:', recoveryError);
            this.forceReset();
        }
    }

    /**
     * 嘗試移動操作恢復
     */
    attemptMoveRecovery() {
        try {
            console.log('Attempting move recovery...');
            
            // 恢復到上一個有效狀態
            if (this.previousState) {
                this.restoreState();
                console.log('Restored to previous state');
            } else {
                // 如果沒有上一個狀態，驗證當前狀態
                this.validateGameState();
                console.log('Current state validated');
            }
        } catch (recoveryError) {
            console.error('Move recovery failed:', recoveryError);
            this.attemptRecovery();
        }
    }

    /**
     * 強制重置遊戲
     */
    forceReset() {
        try {
            console.log('Forcing game reset...');
            
            this.size = 4; // 重置為默認大小
            this.board = new Board(this.size);
            this.score = 0;
            this.isWin = false;
            this.isGameOver = false;
            this.moveCount = 0;
            this.previousState = null;
            this.errorCount = 0;
            this.lastError = null;
            
            this.initializeGame();
            
            console.log('Game force reset completed');
        } catch (resetError) {
            console.error('Force reset failed:', resetError);
            // 最後的手段：拋出錯誤讓上層處理
            throw new Error('Game is in an unrecoverable state');
        }
    }

    /**
     * 檢查遊戲是否處於有效狀態
     * @returns {boolean} 遊戲狀態是否有效
     */
    isValidState() {
        try {
            this.validateGameState();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 獲取錯誤統計
     * @returns {Object} 錯誤統計信息
     */
    getErrorStats() {
        return {
            errorCount: this.errorCount,
            lastError: this.lastError,
            maxErrors: this.maxErrors,
            isHealthy: this.errorCount < this.maxErrors / 2
        };
    }

    /**
     * 清除錯誤統計
     */
    clearErrorStats() {
        this.errorCount = 0;
        this.lastError = null;
    }
}

// 支援Node.js模組導出（用於測試）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}

// 瀏覽器環境下將類添加到全域範圍
if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
}