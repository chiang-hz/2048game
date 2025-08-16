/**
 * GameUI類 - 遊戲用戶界面管理
 * 負責渲染遊戲界面、處理動畫效果、更新UI狀態
 */
class GameUI {
    /**
     * 創建遊戲UI管理器
     * @param {GameEngine} gameEngine - 遊戲引擎實例
     */
    constructor(gameEngine) {
        try {
            this.validateGameEngine(gameEngine);
            this.gameEngine = gameEngine;
            
            // 驗證並獲取DOM元素
            this.initializeDOMElements();
            
            this.tileElements = new Map(); // 存儲方塊元素的映射
            this.animationQueue = []; // 動畫隊列
            this.isAnimating = false;
            this.animationCallbacks = []; // 動畫完成回調隊列
            this.animationDuration = 250; // 動畫持續時間（毫秒）
            
            // 錯誤處理相關
            this.errorCount = 0;
            this.maxErrors = 5;
            this.lastError = null;
            this.fallbackMode = false;
            
            this.initializeBoard();
            this.bindEvents();
        } catch (error) {
            this.handleUIError('GameUI constructor failed', error);
            throw error;
        }
    }

    /**
     * 驗證遊戲引擎
     * @param {GameEngine} gameEngine - 遊戲引擎實例
     */
    validateGameEngine(gameEngine) {
        if (!gameEngine) {
            throw new Error('GameEngine is required');
        }
        
        if (typeof gameEngine.getBoard !== 'function' ||
            typeof gameEngine.getScore !== 'function' ||
            typeof gameEngine.move !== 'function') {
            throw new Error('Invalid GameEngine: missing required methods');
        }
    }

    /**
     * 初始化DOM元素
     */
    initializeDOMElements() {
        const requiredElements = {
            boardElement: 'game-board',
            scoreElement: 'score',
            messageElement: 'game-message',
            messageTextElement: 'message-text',
            restartButton: 'restart',
            tryAgainButton: 'try-again'
        };

        for (const [property, elementId] of Object.entries(requiredElements)) {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Required DOM element not found: ${elementId}`);
            }
            this[property] = element;
        }
    }

    /**
     * 初始化遊戲板UI
     */
    initializeBoard() {
        this.boardElement.innerHTML = '';
        
        // 創建網格背景
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                this.boardElement.appendChild(cell);
            }
        }
        
        this.render();
        
        // 強制初始化分數顯示
        this.scoreElement.textContent = this.gameEngine.getScore();
    }

    /**
     * 渲染整個遊戲界面
     * 完整重新渲染所有UI組件
     */
    render() {
        try {
            if (this.fallbackMode) {
                this.renderFallback();
                return;
            }

            this.validateUIState();
            this.updateBoard();
            this.updateGameState();
        } catch (error) {
            this.handleUIError('Render failed', error);
            this.enterFallbackMode();
        }
    }

    /**
     * 驗證UI狀態
     */
    validateUIState() {
        if (!this.gameEngine) {
            throw new Error('GameEngine is not available');
        }

        if (!this.boardElement || !this.scoreElement) {
            throw new Error('Required DOM elements are missing');
        }

        // 檢查遊戲引擎狀態
        if (!this.gameEngine.isValidState || !this.gameEngine.isValidState()) {
            throw new Error('GameEngine is in invalid state');
        }
    }

    /**
     * 降級渲染模式
     */
    renderFallback() {
        try {
            console.log('Rendering in fallback mode');
            
            // 顯示基本的錯誤訊息
            if (this.messageElement && this.messageTextElement) {
                this.messageTextElement.textContent = '遊戲遇到問題，請重新開始';
                this.messageElement.classList.add('show');
            }
            
            // 顯示重新開始按鈕
            if (this.restartButton) {
                this.restartButton.style.display = 'block';
            }
            
            // 清空遊戲板
            if (this.boardElement) {
                this.boardElement.innerHTML = '<div class="error-message">請重新開始遊戲</div>';
            }
        } catch (error) {
            console.error('Fallback render failed:', error);
        }
    }

    /**
     * 更新遊戲板顯示
     * 根據遊戲引擎的當前狀態重新渲染所有方塊
     */
    updateBoard() {
        // 清除現有的方塊元素
        const existingTiles = this.boardElement.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());
        this.tileElements.clear();

        const board = this.gameEngine.getBoard();
        
        // 創建新的方塊元素
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = board.getCell(row, col);
                if (value !== 0) {
                    this.createTileElement(row, col, value);
                }
            }
        }
        
        // 觸發重新佈局以確保位置正確
        this.boardElement.offsetHeight;
    }

    /**
     * 創建方塊元素
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @param {number} value - 方塊值
     */
    createTileElement(row, col, value) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        
        // 添加位置數據屬性
        tile.dataset.row = row;
        tile.dataset.col = col;
        tile.dataset.value = value;
        
        // 設置位置
        this.setTilePosition(tile, row, col);
        
        this.boardElement.appendChild(tile);
        this.tileElements.set(`${row}-${col}`, tile);
    }

    /**
     * 設置方塊位置
     * @param {HTMLElement} tile - 方塊元素
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     */
    setTilePosition(tile, row, col) {
        // 計算實際的格子大小
        // 遊戲板總寬度500px - 左右padding 20px - 3個gap 30px = 450px
        // 450px ÷ 4 = 112.5px 每個格子
        const cellSize = 112.5; // 方塊大小
        const gap = 10; // 間隙
        const boardPadding = 10; // 遊戲板的內邊距
        
        const x = boardPadding + col * (cellSize + gap);
        const y = boardPadding + row * (cellSize + gap);
        
        tile.style.left = `${x}px`;
        tile.style.top = `${y}px`;
    }

    /**
     * 更新分數顯示
     * 實時顯示當前分數並添加更新動畫效果
     */
    updateScore() {
        const newScore = this.gameEngine.getScore();
        const currentScore = parseInt(this.scoreElement.textContent) || 0;
        
        // 如果分數有變化，添加動畫效果
        if (newScore !== currentScore) {
            this.scoreElement.classList.add('updated');
            setTimeout(() => {
                this.scoreElement.classList.remove('updated');
            }, 300);
        }
        
        this.scoreElement.textContent = newScore;
    }

    /**
     * 更新遊戲狀態顯示
     * 根據遊戲引擎狀態顯示相應的UI反饋
     */
    updateGameStatus() {
        if (this.gameEngine.isWinState()) {
            this.showWin();
        } else if (this.gameEngine.isGameOverState()) {
            this.showGameOver();
        } else {
            this.hideMessage();
        }
    }

    /**
     * 完整更新UI狀態
     * 包括分數、遊戲狀態和特殊效果
     */
    updateGameState() {
        this.updateScore();
        this.updateGameStatus();
        
        // 檢查是否有特殊狀態需要處理
        const gameState = this.gameEngine.getGameState();
        
        // 如果遊戲剛開始，確保UI正確初始化
        if (gameState.moveCount === 0 && gameState.score === 0) {
            this.hideMessage();
        }
    }

    /**
     * 顯示勝利訊息
     * 顯示勝利狀態並提供重新開始選項
     */
    showWin() {
        this.messageTextElement.textContent = '你贏了！';
        this.messageElement.classList.add('show');
        
        // 確保重新開始按鈕可見且可用
        this.tryAgainButton.style.display = 'inline-block';
        this.tryAgainButton.textContent = '再玩一次';
        
        // 添加勝利音效或特殊效果（如果需要）
        this.addWinEffects();
    }

    /**
     * 顯示遊戲結束訊息
     * 顯示失敗狀態並提供重新開始選項
     */
    showGameOver() {
        this.messageTextElement.textContent = '遊戲結束';
        this.messageElement.classList.add('show');
        
        // 確保重新開始按鈕可見且可用
        this.tryAgainButton.style.display = 'inline-block';
        this.tryAgainButton.textContent = '再試一次';
        
        // 顯示最終分數
        this.showFinalScore();
    }

    /**
     * 隱藏訊息覆蓋層
     */
    hideMessage() {
        this.messageElement.classList.remove('show');
    }

    /**
     * 顯示最終分數
     */
    showFinalScore() {
        const finalScore = this.gameEngine.getScore();
        const moveCount = this.gameEngine.getMoveCount();
        
        // 可以在訊息中添加分數信息
        const scoreInfo = document.createElement('div');
        scoreInfo.className = 'final-score-info';
        scoreInfo.innerHTML = `
            <div>最終分數: ${finalScore}</div>
            <div>移動次數: ${moveCount}</div>
        `;
        
        // 清除之前的分數信息
        const existingScoreInfo = this.messageElement.querySelector('.final-score-info');
        if (existingScoreInfo) {
            existingScoreInfo.remove();
        }
        
        // 在按鈕前插入分數信息
        this.messageElement.querySelector('.message-content').insertBefore(
            scoreInfo, 
            this.tryAgainButton
        );
    }

    /**
     * 添加勝利特效
     */
    addWinEffects() {
        // 為勝利狀態添加特殊的視覺效果
        this.messageElement.classList.add('win-state');
        
        // 可以添加更多勝利效果，如彩帶動畫等
        setTimeout(() => {
            this.messageElement.classList.remove('win-state');
        }, 2000);
    }

    /**
     * 重置遊戲狀態顯示
     */
    resetGameStateDisplay() {
        this.hideMessage();
        this.clearAnimations();
        
        // 清除任何特殊狀態類
        this.messageElement.classList.remove('win-state');
        
        // 清除最終分數信息
        const scoreInfo = this.messageElement.querySelector('.final-score-info');
        if (scoreInfo) {
            scoreInfo.remove();
        }
    }

    /**
     * 執行移動動畫
     * @param {string} direction - 移動方向
     * @param {Function} callback - 動畫完成回調
     */
    animateMove(direction, callback) {
        if (this.isAnimating) {
            // 如果正在動畫中，將回調加入隊列
            if (callback) {
                this.animationCallbacks.push(callback);
            }
            return;
        }
        
        this.isAnimating = true;
        this.boardElement.classList.add('animating');
        
        // 添加回調到隊列
        if (callback) {
            this.animationCallbacks.push(callback);
        }
        
        // 執行移動動畫
        this.performMoveAnimation(direction, () => {
            // 動畫完成後的處理
            this.boardElement.classList.remove('animating');
            this.isAnimating = false;
            
            // 執行所有回調
            this.executeAnimationCallbacks();
        });
    }

    /**
     * 執行具體的移動動畫邏輯
     * @param {string} direction - 移動方向
     * @param {Function} onComplete - 動畫完成回調
     */
    performMoveAnimation(direction, onComplete) {
        // 記錄移動前的方塊狀態
        const beforeState = this.captureCurrentTileState();
        
        // 立即更新遊戲邏輯但不更新UI
        // 遊戲邏輯已經在handleMove中執行了，這裡我們需要獲取移動後的狀態
        const afterBoard = this.gameEngine.getBoard();
        
        // 計算並執行移動動畫
        this.animateTileMovement(beforeState, afterBoard, direction, () => {
            // 動畫完成後更新UI並添加新方塊
            this.updateBoard();
            
            // 為新方塊添加出現動畫
            setTimeout(() => {
                this.addNewTileAnimation(beforeState);
                if (onComplete) onComplete();
            }, 50);
        });
    }
    
    /**
     * 捕獲當前方塊狀態
     * @returns {Array} 方塊狀態數組
     */
    captureCurrentTileState() {
        const tiles = [];
        const tileElements = this.boardElement.querySelectorAll('.tile');
        
        tileElements.forEach(tile => {
            tiles.push({
                element: tile,
                row: parseInt(tile.dataset.row),
                col: parseInt(tile.dataset.col),
                value: parseInt(tile.dataset.value),
                left: tile.style.left,
                top: tile.style.top
            });
        });
        
        return tiles;
    }
    
    /**
     * 執行方塊移動動畫
     * @param {Array} beforeState - 移動前的方塊狀態
     * @param {Board} afterBoard - 移動後的遊戲板
     * @param {string} direction - 移動方向
     * @param {Function} onComplete - 完成回調
     */
    animateTileMovement(beforeState, afterBoard, direction, onComplete) {
        const movePromises = [];
        
        beforeState.forEach(tileState => {
            // 找到這個方塊移動後的位置
            const newPosition = this.findNewPosition(tileState, afterBoard, direction);
            
            if (newPosition) {
                // 創建移動動畫
                const promise = this.animateSingleTile(tileState, newPosition);
                movePromises.push(promise);
            } else {
                // 方塊被移除，淡出
                this.fadeOutTile(tileState.element);
            }
        });
        
        // 等待所有動畫完成
        Promise.all(movePromises).then(() => {
            if (onComplete) onComplete();
        });
    }
    
    /**
     * 找到方塊的新位置
     * @param {Object} tileState - 方塊狀態
     * @param {Board} afterBoard - 移動後的遊戲板
     * @param {string} direction - 移動方向
     * @returns {Object|null} 新位置信息
     */
    findNewPosition(tileState, afterBoard, direction) {
        // 根據移動方向搜索可能的新位置
        const searchOrder = this.getSearchOrder(tileState.row, tileState.col, direction);
        
        for (const pos of searchOrder) {
            const cellValue = afterBoard.getCell(pos.row, pos.col);
            if (cellValue > 0) {
                // 檢查是否是這個方塊或合併後的結果
                if (cellValue === tileState.value || cellValue === tileState.value * 2) {
                    return {
                        row: pos.row,
                        col: pos.col,
                        value: cellValue,
                        isMerged: cellValue !== tileState.value
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * 獲取搜索順序
     * @param {number} startRow - 起始行
     * @param {number} startCol - 起始列
     * @param {string} direction - 移動方向
     * @returns {Array} 搜索位置數組
     */
    getSearchOrder(startRow, startCol, direction) {
        const positions = [];
        
        switch (direction) {
            case 'left':
                for (let col = 0; col <= startCol; col++) {
                    positions.push({ row: startRow, col });
                }
                break;
            case 'right':
                for (let col = 3; col >= startCol; col--) {
                    positions.push({ row: startRow, col });
                }
                break;
            case 'up':
                for (let row = 0; row <= startRow; row++) {
                    positions.push({ row, col: startCol });
                }
                break;
            case 'down':
                for (let row = 3; row >= startRow; row--) {
                    positions.push({ row, col: startCol });
                }
                break;
        }
        
        return positions;
    }
    
    /**
     * 動畫單個方塊
     * @param {Object} tileState - 方塊狀態
     * @param {Object} newPosition - 新位置
     * @returns {Promise} 動畫完成的Promise
     */
    animateSingleTile(tileState, newPosition) {
        return new Promise((resolve) => {
            const tile = tileState.element;
            
            // 計算目標位置
            const cellSize = 112.5;
            const gap = 10;
            const boardPadding = 10;
            
            const targetLeft = boardPadding + newPosition.col * (cellSize + gap);
            const targetTop = boardPadding + newPosition.row * (cellSize + gap);
            
            // 添加移動動畫類
            tile.classList.add('tile-moving');
            
            // 設置目標位置
            tile.style.left = `${targetLeft}px`;
            tile.style.top = `${targetTop}px`;
            
            // 如果是合併的方塊，在動畫中途更新值和樣式
            if (newPosition.isMerged) {
                setTimeout(() => {
                    tile.textContent = newPosition.value;
                    tile.className = `tile tile-${newPosition.value} tile-moving tile-merged`;
                    tile.dataset.value = newPosition.value;
                }, this.animationDuration / 2);
            }
            
            // 更新位置數據
            tile.dataset.row = newPosition.row;
            tile.dataset.col = newPosition.col;
            
            // 動畫完成後清理
            setTimeout(() => {
                tile.classList.remove('tile-moving', 'tile-merged');
                resolve();
            }, this.animationDuration);
        });
    }
    
    /**
     * 淡出方塊
     * @param {HTMLElement} tile - 方塊元素
     */
    fadeOutTile(tile) {
        tile.style.opacity = '0';
        tile.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            if (tile.parentNode) {
                tile.parentNode.removeChild(tile);
            }
        }, this.animationDuration);
    }
    
    /**
     * 為新出現的方塊添加動畫
     * @param {Array} beforeState - 移動前的狀態
     */
    addNewTileAnimation(beforeState) {
        const beforePositions = new Set();
        beforeState.forEach(tile => {
            beforePositions.add(`${tile.row}-${tile.col}`);
        });
        
        const currentTiles = this.boardElement.querySelectorAll('.tile');
        currentTiles.forEach(tile => {
            const row = parseInt(tile.dataset.row);
            const col = parseInt(tile.dataset.col);
            const posKey = `${row}-${col}`;
            
            if (!beforePositions.has(posKey)) {
                tile.classList.add('tile-new');
                setTimeout(() => {
                    tile.classList.remove('tile-new');
                }, this.animationDuration);
            }
        });
    }



    /**
     * 執行動畫隊列中的所有回調
     */
    executeAnimationCallbacks() {
        const callbacks = [...this.animationCallbacks];
        this.animationCallbacks = [];
        
        callbacks.forEach(callback => {
            if (typeof callback === 'function') {
                callback();
            }
        });
    }

    /**
     * 添加動畫到隊列
     * @param {Function} animationFn - 動畫函數
     * @param {Function} callback - 完成回調
     */
    queueAnimation(animationFn, callback) {
        this.animationQueue.push({
            animation: animationFn,
            callback: callback
        });
        
        // 如果沒有正在執行的動畫，開始執行隊列
        if (!this.isAnimating) {
            this.processAnimationQueue();
        }
    }

    /**
     * 處理動畫隊列
     */
    processAnimationQueue() {
        if (this.animationQueue.length === 0 || this.isAnimating) {
            return;
        }
        
        const { animation, callback } = this.animationQueue.shift();
        
        this.isAnimating = true;
        
        animation(() => {
            this.isAnimating = false;
            
            if (callback) callback();
            
            // 繼續處理隊列中的下一個動畫
            this.processAnimationQueue();
        });
    }

    /**
     * 添加新方塊動畫
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @param {number} value - 方塊值
     */
    animateNewTile(row, col, value) {
        const tile = this.tileElements.get(`${row}-${col}`);
        if (tile) {
            tile.classList.add('tile-new');
            
            // 移除動畫類
            setTimeout(() => {
                tile.classList.remove('tile-new');
            }, this.animationDuration);
        }
    }

    /**
     * 添加方塊合併動畫
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     */
    animateMergedTile(row, col) {
        const tile = this.tileElements.get(`${row}-${col}`);
        if (tile) {
            tile.classList.add('tile-merged');
            
            // 移除動畫類
            setTimeout(() => {
                tile.classList.remove('tile-merged');
            }, this.animationDuration);
        }
    }

    /**
     * 清除所有動畫狀態
     */
    clearAnimations() {
        this.isAnimating = false;
        this.animationQueue = [];
        this.animationCallbacks = [];
        this.boardElement.classList.remove('animating');
        
        // 清除所有方塊的動畫類
        const tiles = this.boardElement.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.classList.remove('tile-moving', 'tile-new', 'tile-merged');
        });
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 重新開始按鈕
        this.restartButton.addEventListener('click', () => {
            this.handleRestart();
        });

        // 再試一次按鈕
        this.tryAgainButton.addEventListener('click', () => {
            this.handleRestart();
        });
    }

    /**
     * 處理重新開始遊戲
     * 統一的重新開始邏輯，包括UI重置
     */
    handleRestart() {
        this.safeRestart();
    }

    /**
     * 添加重新開始的視覺反饋
     */
    addRestartFeedback() {
        // 為重新開始添加簡單的視覺反饋
        this.boardElement.style.opacity = '0.7';
        
        setTimeout(() => {
            this.boardElement.style.opacity = '1';
        }, 100);
    }

    /**
     * 處理遊戲移動
     * @param {string} direction - 移動方向
     */
    handleMove(direction) {
        try {
            if (this.fallbackMode) {
                this.showErrorMessage('遊戲處於錯誤狀態，請重新開始');
                return;
            }

            if (this.isAnimating) {
                return;
            }

            this.validateUIState();
            
            // 檢查是否可以移動
            const canMove = this.gameEngine.canMove(direction);
            if (!canMove) {
                return;
            }
            
            // 執行移動並播放動畫
            const moved = this.gameEngine.move(direction);
            if (moved) {
                this.animateMove(direction, () => {
                    // 動畫完成後更新分數和檢查遊戲狀態
                    this.updateScore();
                    this.updateGameStatus();
                    this.checkForErrors();
                });
            }
        } catch (error) {
            this.handleUIError(`Move handling failed for direction: ${direction}`, error);
        }
    }

    /**
     * 獲取動畫狀態
     * @returns {boolean} 是否正在動畫
     */
    getAnimationState() {
        return this.isAnimating;
    }

    /**
     * 處理UI錯誤
     * @param {string} message - 錯誤訊息
     * @param {Error} error - 錯誤對象
     */
    handleUIError(message, error) {
        this.errorCount++;
        this.lastError = {
            message: message,
            error: error.message || error.toString(),
            timestamp: new Date().toISOString()
        };

        console.error(`GameUI Error: ${message}`, error);

        // 顯示用戶友好的錯誤訊息
        this.showErrorMessage('遊戲遇到問題，正在嘗試恢復...');

        // 如果錯誤次數過多，進入降級模式
        if (this.errorCount >= this.maxErrors) {
            this.enterFallbackMode();
        } else {
            // 嘗試恢復
            this.attemptUIRecovery();
        }
    }

    /**
     * 顯示錯誤訊息
     * @param {string} message - 錯誤訊息
     */
    showErrorMessage(message) {
        try {
            if (this.messageElement && this.messageTextElement) {
                this.messageTextElement.textContent = message;
                this.messageElement.classList.add('show', 'error-state');
                
                // 3秒後自動隱藏錯誤訊息
                setTimeout(() => {
                    if (this.messageElement.classList.contains('error-state')) {
                        this.hideMessage();
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to show error message:', error);
        }
    }

    /**
     * 進入降級模式
     */
    enterFallbackMode() {
        console.warn('Entering UI fallback mode');
        this.fallbackMode = true;
        this.clearAnimations();
        this.renderFallback();
    }

    /**
     * 退出降級模式
     */
    exitFallbackMode() {
        console.log('Exiting UI fallback mode');
        this.fallbackMode = false;
        this.errorCount = 0;
        this.lastError = null;
    }

    /**
     * 嘗試UI恢復
     */
    attemptUIRecovery() {
        try {
            console.log('Attempting UI recovery...');
            
            // 清除動畫狀態
            this.clearAnimations();
            
            // 重新驗證DOM元素
            this.initializeDOMElements();
            
            // 重新初始化遊戲板
            this.initializeBoard();
            
            // 重新渲染
            this.render();
            
            console.log('UI recovery successful');
        } catch (recoveryError) {
            console.error('UI recovery failed:', recoveryError);
            this.enterFallbackMode();
        }
    }

    /**
     * 檢查錯誤狀態
     */
    checkForErrors() {
        try {
            // 檢查遊戲引擎錯誤
            if (this.gameEngine.getErrorStats) {
                const errorStats = this.gameEngine.getErrorStats();
                if (!errorStats.isHealthy) {
                    this.showErrorMessage('遊戲狀態不穩定，建議重新開始');
                }
            }
            
            // 檢查UI狀態
            this.validateUIState();
        } catch (error) {
            this.handleUIError('Error check failed', error);
        }
    }

    /**
     * 安全的重新開始處理
     */
    safeRestart() {
        try {
            console.log('Performing safe restart...');
            
            // 退出降級模式
            this.exitFallbackMode();
            
            // 清除所有錯誤狀態
            this.clearAnimations();
            this.hideMessage();
            
            // 重新開始遊戲引擎
            if (this.gameEngine.clearErrorStats) {
                this.gameEngine.clearErrorStats();
            }
            
            this.gameEngine.restart();
            
            // 重新渲染UI
            this.render();
            
            console.log('Safe restart completed');
        } catch (error) {
            console.error('Safe restart failed:', error);
            this.handleUIError('Restart failed', error);
        }
    }

    /**
     * 獲取UI錯誤統計
     * @returns {Object} UI錯誤統計
     */
    getUIErrorStats() {
        return {
            errorCount: this.errorCount,
            lastError: this.lastError,
            maxErrors: this.maxErrors,
            fallbackMode: this.fallbackMode,
            isHealthy: this.errorCount < this.maxErrors / 2 && !this.fallbackMode
        };
    }
}

// 支援Node.js模組導出（用於測試）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameUI;
}

// 瀏覽器環境下將類添加到全域範圍
if (typeof window !== 'undefined') {
    window.GameUI = GameUI;
}