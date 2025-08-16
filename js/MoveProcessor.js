/**
 * MoveProcessor類 - 處理方塊移動和合併邏輯
 * 實現四個方向的移動算法和移動有效性檢查
 */
class MoveProcessor {
    /**
     * 向左移動
     * @param {Board} board - 遊戲板實例
     * @returns {Object} 移動結果 {moved: boolean, score: number}
     */
    static moveLeft(board) {
        let moved = false;
        let score = 0;
        
        for (let row = 0; row < board.size; row++) {
            const line = [];
            // 收集非零元素
            for (let col = 0; col < board.size; col++) {
                const value = board.getCell(row, col);
                if (value !== 0) {
                    line.push(value);
                }
            }
            
            // 合併相同的相鄰元素
            const merged = this.mergeLine(line);
            score += merged.score;
            
            // 填充回網格
            for (let col = 0; col < board.size; col++) {
                const newValue = col < merged.line.length ? merged.line[col] : 0;
                if (board.getCell(row, col) !== newValue) {
                    moved = true;
                    board.setCell(row, col, newValue);
                }
            }
        }
        
        return { moved, score };
    }

    /**
     * 向右移動
     * @param {Board} board - 遊戲板實例
     * @returns {Object} 移動結果 {moved: boolean, score: number}
     */
    static moveRight(board) {
        // 反轉每行，執行左移，再反轉回來
        this.reverseRows(board);
        const result = this.moveLeft(board);
        this.reverseRows(board);
        return result;
    }

    /**
     * 向上移動
     * @param {Board} board - 遊戲板實例
     * @returns {Object} 移動結果 {moved: boolean, score: number}
     */
    static moveUp(board) {
        // 轉置矩陣，執行左移，再轉置回來
        this.transpose(board);
        const result = this.moveLeft(board);
        this.transpose(board);
        return result;
    }

    /**
     * 向下移動
     * @param {Board} board - 遊戲板實例
     * @returns {Object} 移動結果 {moved: boolean, score: number}
     */
    static moveDown(board) {
        // 轉置矩陣，執行右移，再轉置回來
        this.transpose(board);
        const result = this.moveRight(board);
        this.transpose(board);
        return result;
    }

    /**
     * 檢查是否可以向指定方向移動
     * @param {Board} board - 遊戲板實例
     * @param {string} direction - 移動方向 ('left', 'right', 'up', 'down')
     * @returns {boolean} 是否可以移動
     */
    static canMove(board, direction) {
        const testBoard = board.clone();
        let result;
        
        switch (direction) {
            case 'left':
                result = this.moveLeft(testBoard);
                break;
            case 'right':
                result = this.moveRight(testBoard);
                break;
            case 'up':
                result = this.moveUp(testBoard);
                break;
            case 'down':
                result = this.moveDown(testBoard);
                break;
            default:
                return false;
        }
        
        return result.moved;
    }

    /**
     * 合併一行中的相同元素
     * @param {Array} line - 要合併的行
     * @returns {Object} 合併結果 {line: Array, score: number}
     */
    static mergeLine(line) {
        const merged = [];
        let score = 0;
        let i = 0;
        
        while (i < line.length) {
            if (i < line.length - 1 && line[i] === line[i + 1]) {
                // 合併相同的相鄰元素
                const mergedValue = line[i] * 2;
                merged.push(mergedValue);
                score += mergedValue;
                i += 2; // 跳過下一個元素
            } else {
                merged.push(line[i]);
                i++;
            }
        }
        
        return { line: merged, score };
    }

    /**
     * 反轉網格的每一行
     * @param {Board} board - 遊戲板實例
     */
    static reverseRows(board) {
        for (let row = 0; row < board.size; row++) {
            for (let col = 0; col < board.size / 2; col++) {
                const temp = board.getCell(row, col);
                board.setCell(row, col, board.getCell(row, board.size - 1 - col));
                board.setCell(row, board.size - 1 - col, temp);
            }
        }
    }

    /**
     * 轉置網格矩陣
     * @param {Board} board - 遊戲板實例
     */
    static transpose(board) {
        for (let row = 0; row < board.size; row++) {
            for (let col = row + 1; col < board.size; col++) {
                const temp = board.getCell(row, col);
                board.setCell(row, col, board.getCell(col, row));
                board.setCell(col, row, temp);
            }
        }
    }
}

// 支援Node.js模組導出（用於測試）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoveProcessor;
}

// 瀏覽器環境下將類添加到全域範圍
if (typeof window !== 'undefined') {
    window.MoveProcessor = MoveProcessor;
}