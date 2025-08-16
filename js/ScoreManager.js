/**
 * ScoreManager類 - 管理高分排行榜
 * 負責保存、載入和更新前三名高分記錄
 */
class ScoreManager {
    constructor() {
        this.storageKey = '2048-leaderboard';
        this.maxScores = 3;
        this.scores = this.loadScores();
        this.bestScoreElement = document.getElementById('best-score');
        this.leaderboardElement = document.getElementById('leaderboard-list');
        
        this.updateDisplay();
    }
    
    /**
     * 從localStorage載入分數
     * @returns {Array} 分數數組
     */
    loadScores() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const scores = JSON.parse(saved);
                // 確保是有效的分數數組
                if (Array.isArray(scores) && scores.every(score => 
                    typeof score === 'object' && 
                    typeof score.value === 'number' && 
                    typeof score.date === 'string'
                )) {
                    return scores.slice(0, this.maxScores);
                }
            }
        } catch (error) {
            console.warn('載入高分記錄失敗:', error);
        }
        
        // 返回默認空分數
        return Array(this.maxScores).fill(null).map(() => ({
            value: 0,
            date: new Date().toLocaleDateString('zh-TW')
        }));
    }
    
    /**
     * 保存分數到localStorage
     */
    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (error) {
            console.warn('保存高分記錄失敗:', error);
        }
    }
    
    /**
     * 檢查並更新高分
     * @param {number} newScore - 新分數
     * @returns {number|null} 如果進入排行榜，返回排名（0-2），否則返回null
     */
    checkAndUpdateScore(newScore) {
        if (typeof newScore !== 'number' || newScore <= 0) {
            return null;
        }
        
        // 檢查是否能進入排行榜
        const lowestScore = this.scores[this.maxScores - 1].value;
        if (newScore <= lowestScore) {
            return null;
        }
        
        // 創建新分數記錄
        const newRecord = {
            value: newScore,
            date: new Date().toLocaleDateString('zh-TW')
        };
        
        // 找到插入位置
        let insertIndex = -1;
        for (let i = 0; i < this.scores.length; i++) {
            if (newScore > this.scores[i].value) {
                insertIndex = i;
                break;
            }
        }
        
        if (insertIndex !== -1) {
            // 插入新分數並移除最後一個
            this.scores.splice(insertIndex, 0, newRecord);
            this.scores = this.scores.slice(0, this.maxScores);
            
            this.saveScores();
            this.updateDisplay();
            this.highlightNewScore(insertIndex);
            
            return insertIndex;
        }
        
        return null;
    }
    
    /**
     * 獲取最高分
     * @returns {number} 最高分
     */
    getBestScore() {
        return this.scores.length > 0 ? this.scores[0].value : 0;
    }
    
    /**
     * 更新顯示
     */
    updateDisplay() {
        // 更新最高分顯示
        if (this.bestScoreElement) {
            this.bestScoreElement.textContent = this.getBestScore();
        }
        
        // 更新排行榜顯示
        if (this.leaderboardElement) {
            const items = this.leaderboardElement.querySelectorAll('.leaderboard-item');
            items.forEach((item, index) => {
                if (index < this.scores.length) {
                    const scoreValue = item.querySelector('.score-value');
                    if (scoreValue) {
                        scoreValue.textContent = this.scores[index].value;
                    }
                }
            });
        }
    }
    
    /**
     * 高亮新分數
     * @param {number} index - 分數在排行榜中的位置
     */
    highlightNewScore(index) {
        if (this.leaderboardElement) {
            const items = this.leaderboardElement.querySelectorAll('.leaderboard-item');
            if (items[index]) {
                items[index].classList.add('highlight');
                
                // 3秒後移除高亮
                setTimeout(() => {
                    items[index].classList.remove('highlight');
                }, 3000);
            }
        }
    }
    
    /**
     * 清除所有分數記錄
     */
    clearScores() {
        this.scores = Array(this.maxScores).fill(null).map(() => ({
            value: 0,
            date: new Date().toLocaleDateString('zh-TW')
        }));
        
        this.saveScores();
        this.updateDisplay();
    }
    
    /**
     * 獲取排行榜數據
     * @returns {Array} 排行榜數據
     */
    getLeaderboard() {
        return [...this.scores];
    }
    
    /**
     * 檢查分數是否能進入排行榜
     * @param {number} score - 要檢查的分數
     * @returns {boolean} 是否能進入排行榜
     */
    canEnterLeaderboard(score) {
        if (typeof score !== 'number' || score <= 0) {
            return false;
        }
        
        const lowestScore = this.scores[this.maxScores - 1].value;
        return score > lowestScore;
    }
    
    /**
     * 獲取統計信息
     * @returns {Object} 統計信息
     */
    getStats() {
        const validScores = this.scores.filter(score => score.value > 0);
        
        return {
            totalGames: validScores.length,
            bestScore: this.getBestScore(),
            averageScore: validScores.length > 0 ? 
                Math.round(validScores.reduce((sum, score) => sum + score.value, 0) / validScores.length) : 0,
            lastPlayDate: validScores.length > 0 ? validScores[0].date : null
        };
    }
}

// 瀏覽器環境下將類添加到全域範圍
if (typeof window !== 'undefined') {
    window.ScoreManager = ScoreManager;
}

// 支援Node.js模組導出（用於測試）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreManager;
}