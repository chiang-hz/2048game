/**
 * Board類 - 管理4x4遊戲網格
 * 負責網格數據操作、隨機方塊生成和基本網格查詢
 */
class Board {
    /**
     * 創建新的遊戲板
     * @param {number} size - 網格大小，默認為4
     */
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.initialize();
    }

    /**
     * 初始化空的網格
     */
    initialize() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    }

    /**
     * 獲取指定位置的方塊值
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {number} 方塊值
     */
    getCell(row, col) {
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
            return null;
        }
        return this.grid[row][col];
    }

    /**
     * 設置指定位置的方塊值
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} value - 要設置的值
     */
    setCell(row, col, value) {
        if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
            this.grid[row][col] = value;
        }
    }

    /**
     * 在隨機空位置添加新方塊
     * @returns {boolean} 是否成功添加方塊
     */
    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) {
            return false;
        }

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4; // 90%機率生成2，10%機率生成4
        this.setCell(randomCell.row, randomCell.col, value);
        return true;
    }

    /**
     * 獲取所有空位置
     * @returns {Array} 空位置數組
     */
    getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    /**
     * 檢查網格是否為空
     * @returns {boolean} 是否為空
     */
    isEmpty() {
        return this.getEmptyCells().length === this.size * this.size;
    }

    /**
     * 檢查網格是否已滿
     * @returns {boolean} 是否已滿
     */
    isFull() {
        return this.getEmptyCells().length === 0;
    }

    /**
     * 克隆當前網格
     * @returns {Board} 新的Board實例
     */
    clone() {
        const newBoard = new Board(this.size);
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                newBoard.setCell(row, col, this.getCell(row, col));
            }
        }
        return newBoard;
    }

    /**
     * 比較兩個網格是否相等
     * @param {Board} otherBoard - 要比較的另一個Board實例
     * @returns {boolean} 是否相等
     */
    equals(otherBoard) {
        if (!otherBoard || otherBoard.size !== this.size) {
            return false;
        }
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.getCell(row, col) !== otherBoard.getCell(row, col)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 清空網格（將所有方塊設為0）
     */
    clear() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.grid[row][col] = 0;
            }
        }
    }

    /**
     * 獲取網格的二維數組表示
     * @returns {Array} 網格數組
     */
    getGrid() {
        return this.grid.map(row => [...row]);
    }
}

// 支援Node.js模組導出（用於測試）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Board;
}

// 瀏覽器環境下將類添加到全域範圍
if (typeof window !== 'undefined') {
    window.Board = Board;
}