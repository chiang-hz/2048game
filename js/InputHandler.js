/**
 * InputHandler類 - 處理用戶輸入
 * 管理鍵盤和觸控輸入，防止重複輸入
 */
class InputHandler {
    /**
     * 創建輸入處理器
     * @param {GameUI} gameUI - 遊戲UI實例
     */
    constructor(gameUI) {
        try {
            this.validateGameUI(gameUI);
            this.gameUI = gameUI;
            this.isInputBlocked = false;
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchStartTime = 0;
            this.minSwipeDistance = 30; // 最小滑動距離
            
            // 錯誤處理相關
            this.errorCount = 0;
            this.maxErrors = 5;
            this.lastError = null;
            this.inputDisabled = false;
            
            // 綁定方法引用以便後續移除事件監聽器
            this.handleTouchStart = null;
            this.handleTouchEnd = null;
            this.handleTouchMove = null;
            this.handleKeyboard = null;
            
            this.bindKeyboard();
            this.bindTouch();
        } catch (error) {
            this.handleInputError('InputHandler constructor failed', error);
            throw error;
        }
    }

    /**
     * 驗證GameUI實例
     * @param {GameUI} gameUI - 遊戲UI實例
     */
    validateGameUI(gameUI) {
        if (!gameUI) {
            throw new Error('GameUI is required');
        }
        
        if (typeof gameUI.handleMove !== 'function' ||
            typeof gameUI.getAnimationState !== 'function') {
            throw new Error('Invalid GameUI: missing required methods');
        }
    }

    /**
     * 綁定鍵盤事件
     */
    bindKeyboard() {
        try {
            this.handleKeyboard = (event) => {
                try {
                    if (this.inputDisabled || this.isInputBlocked) {
                        return;
                    }

                    let direction = null;
                    
                    switch (event.key) {
                        case 'ArrowLeft':
                        case 'a':
                        case 'A':
                            direction = 'left';
                            break;
                        case 'ArrowRight':
                        case 'd':
                        case 'D':
                            direction = 'right';
                            break;
                        case 'ArrowUp':
                        case 'w':
                        case 'W':
                            direction = 'up';
                            break;
                        case 'ArrowDown':
                        case 's':
                        case 'S':
                            direction = 'down';
                            break;
                        default:
                            return; // 不處理其他按鍵
                    }

                    if (direction) {
                        event.preventDefault();
                        this.handleMove(direction);
                    }
                } catch (error) {
                    this.handleInputError('Keyboard event handling failed', error);
                }
            };

            document.addEventListener('keydown', this.handleKeyboard);
        } catch (error) {
            this.handleInputError('Keyboard binding failed', error);
        }
    }

    /**
     * 綁定觸控事件
     */
    bindTouch() {
        try {
            const gameBoard = document.getElementById('game-board');
            
            if (!gameBoard) {
                throw new Error('Game board element not found');
            }
            
            // 使用箭頭函數綁定this，並存儲引用以便後續移除
            this.handleTouchStart = (event) => {
                try {
                    if (this.inputDisabled || this.isInputBlocked) {
                        return;
                    }
                    
                    // 只處理單點觸控
                    if (event.touches.length !== 1) {
                        return;
                    }
                    
                    const touch = event.touches[0];
                    this.touchStartX = touch.clientX;
                    this.touchStartY = touch.clientY;
                    this.touchStartTime = Date.now(); // 使用Date.now()而不是performance.now()以確保兼容性
                    
                    // 防止默認行為但不阻止事件傳播
                    event.preventDefault();
                } catch (error) {
                    this.handleInputError('Touch start handling failed', error);
                }
            };

            this.handleTouchEnd = (event) => {
                try {
                    if (this.inputDisabled || this.isInputBlocked) {
                        return;
                    }
                    
                    // 檢查觸控時間，防止意外觸發
                    const touchDuration = Date.now() - this.touchStartTime;
                    if (touchDuration > 500) { // 超過500ms的觸控視為無效
                        return;
                    }
                    
                    const touch = event.changedTouches[0];
                    if (!touch) {
                        return;
                    }
                    
                    const touchEndX = touch.clientX;
                    const touchEndY = touch.clientY;
                    
                    const deltaX = touchEndX - this.touchStartX;
                    const deltaY = touchEndY - this.touchStartY;
                    
                    this.handleSwipe(deltaX, deltaY);
                    
                    event.preventDefault();
                } catch (error) {
                    this.handleInputError('Touch end handling failed', error);
                }
            };

            this.handleTouchMove = (event) => {
                try {
                    // 防止滾動，但使用passive: false只在必要時
                    if (event.touches.length === 1) {
                        event.preventDefault();
                    }
                } catch (error) {
                    this.handleInputError('Touch move handling failed', error);
                }
            };

            // 觸控開始 - 使用passive: false因為需要preventDefault
            gameBoard.addEventListener('touchstart', this.handleTouchStart, { 
                passive: false,
                capture: false 
            });

            // 觸控結束 - 使用passive: false因為需要preventDefault
            gameBoard.addEventListener('touchend', this.handleTouchEnd, { 
                passive: false,
                capture: false 
            });

            // 觸控移動 - 防止滾動
            gameBoard.addEventListener('touchmove', this.handleTouchMove, { 
                passive: false,
                capture: false 
            });

            // 添加觸控取消事件處理
            gameBoard.addEventListener('touchcancel', () => {
                try {
                    // 重置觸控狀態
                    this.touchStartX = 0;
                    this.touchStartY = 0;
                    this.touchStartTime = 0;
                } catch (error) {
                    this.handleInputError('Touch cancel handling failed', error);
                }
            }, { passive: true });
        } catch (error) {
            this.handleInputError('Touch binding failed', error);
        }
    }

    /**
     * 處理滑動手勢
     * @param {number} deltaX - X軸位移
     * @param {number} deltaY - Y軸位移
     */
    handleSwipe(deltaX, deltaY) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // 檢查是否達到最小滑動距離
        if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
            return;
        }
        
        let direction = null;
        
        // 判斷主要滑動方向
        if (absDeltaX > absDeltaY) {
            // 水平滑動
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            // 垂直滑動
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        if (direction) {
            this.handleMove(direction);
        }
    }

    /**
     * 處理移動操作
     * @param {string} direction - 移動方向
     */
    handleMove(direction) {
        try {
            if (this.inputDisabled || this.isInputBlocked || !this.gameUI) {
                return;
            }

            // 驗證方向
            if (!this.validateDirection(direction)) {
                return;
            }

            // 檢查動畫狀態
            if (this.gameUI.getAnimationState && this.gameUI.getAnimationState()) {
                return;
            }
            
            // 阻止重複輸入
            this.blockInput();
            
            // 執行移動
            this.gameUI.handleMove(direction);
            
            // 延遲解除輸入阻止
            setTimeout(() => {
                this.unblockInput();
            }, 100);
        } catch (error) {
            this.handleInputError(`Move handling failed for direction: ${direction}`, error);
            this.unblockInput(); // 確保輸入不會永久阻塞
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
     * 處理輸入錯誤
     * @param {string} message - 錯誤訊息
     * @param {Error} error - 錯誤對象
     */
    handleInputError(message, error) {
        this.errorCount++;
        this.lastError = {
            message: message,
            error: error.message || error.toString(),
            timestamp: new Date().toISOString()
        };

        console.error(`InputHandler Error: ${message}`, error);

        // 如果錯誤次數過多，禁用輸入
        if (this.errorCount >= this.maxErrors) {
            console.warn('Too many input errors. Disabling input temporarily.');
            this.disableInput();
            
            // 5秒後重新啟用輸入
            setTimeout(() => {
                this.enableInput();
            }, 5000);
        }
    }

    /**
     * 禁用輸入
     */
    disableInput() {
        this.inputDisabled = true;
        this.isInputBlocked = true;
    }

    /**
     * 啟用輸入
     */
    enableInput() {
        this.inputDisabled = false;
        this.isInputBlocked = false;
        this.errorCount = 0;
        this.lastError = null;
        console.log('Input re-enabled');
    }

    /**
     * 獲取輸入錯誤統計
     * @returns {Object} 輸入錯誤統計
     */
    getInputErrorStats() {
        return {
            errorCount: this.errorCount,
            lastError: this.lastError,
            maxErrors: this.maxErrors,
            inputDisabled: this.inputDisabled,
            isHealthy: this.errorCount < this.maxErrors / 2 && !this.inputDisabled
        };
    }

    /**
     * 阻止輸入
     */
    blockInput() {
        this.isInputBlocked = true;
    }

    /**
     * 解除輸入阻止
     */
    unblockInput() {
        this.isInputBlocked = false;
    }

    /**
     * 獲取輸入阻止狀態
     * @returns {boolean} 是否被阻止
     */
    getInputBlockedState() {
        return this.isInputBlocked;
    }

    /**
     * 設置最小滑動距離
     * @param {number} distance - 最小滑動距離
     */
    setMinSwipeDistance(distance) {
        this.minSwipeDistance = distance;
    }

    /**
     * 銷毀輸入處理器
     */
    destroy() {
        // 移除鍵盤事件監聽器
        if (this.handleKeyboard) {
            document.removeEventListener('keydown', this.handleKeyboard);
        }
        
        // 移除觸控事件監聽器
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            if (this.handleTouchStart) {
                gameBoard.removeEventListener('touchstart', this.handleTouchStart);
            }
            if (this.handleTouchEnd) {
                gameBoard.removeEventListener('touchend', this.handleTouchEnd);
            }
            if (this.handleTouchMove) {
                gameBoard.removeEventListener('touchmove', this.handleTouchMove);
            }
        }
        
        // 清理引用
        this.handleTouchStart = null;
        this.handleTouchEnd = null;
        this.handleTouchMove = null;
        this.gameUI = null;
    }
}

// 支援Node.js模組導出（用於測試）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
}

// 瀏覽器環境下將類添加到全域範圍
if (typeof window !== 'undefined') {
    window.InputHandler = InputHandler;
}