/**
 * PerformanceOptimizer類 - 遊戲性能優化工具
 * 負責監控和優化遊戲性能，包括動畫、渲染和記憶體管理
 */
class PerformanceOptimizer {
    /**
     * 創建性能優化器
     */
    constructor() {
        this.metrics = {
            frameRate: 60,
            renderTime: 0,
            animationTime: 0,
            memoryUsage: 0,
            inputLatency: 0
        };
        
        this.thresholds = {
            maxRenderTime: 16, // 60fps = 16.67ms per frame
            maxAnimationTime: 300,
            maxMemoryUsage: 50, // MB
            maxInputLatency: 100 // ms
        };
        
        this.optimizations = {
            animationReduction: false,
            renderOptimization: false,
            memoryCleanup: false,
            inputThrottling: false
        };
        
        this.performanceLevel = 'high'; // high, medium, low
        this.isMonitoring = false;
        this.monitoringInterval = null;
        
        this.setupPerformanceObserver();
    }
    
    /**
     * 設置性能觀察器
     */
    setupPerformanceObserver() {
        // 檢測設備性能等級
        this.detectDevicePerformance();
        
        // 設置FPS監控
        this.setupFPSMonitoring();
        
        // 設置記憶體監控
        this.setupMemoryMonitoring();
    }
    
    /**
     * 檢測設備性能等級
     */
    detectDevicePerformance() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        let performanceScore = 100;
        
        // 檢查硬體加速支援
        if (!gl) {
            performanceScore -= 30;
        }
        
        // 檢查記憶體
        if (navigator.deviceMemory) {
            if (navigator.deviceMemory < 2) {
                performanceScore -= 20;
            } else if (navigator.deviceMemory < 4) {
                performanceScore -= 10;
            }
        }
        
        // 檢查CPU核心數
        if (navigator.hardwareConcurrency) {
            if (navigator.hardwareConcurrency < 2) {
                performanceScore -= 15;
            } else if (navigator.hardwareConcurrency < 4) {
                performanceScore -= 5;
            }
        }
        
        // 檢查連接類型
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                performanceScore -= 10;
            }
        }
        
        // 設置性能等級
        if (performanceScore >= 80) {
            this.performanceLevel = 'high';
        } else if (performanceScore >= 60) {
            this.performanceLevel = 'medium';
        } else {
            this.performanceLevel = 'low';
        }
        
        console.log(`🔍 設備性能等級: ${this.performanceLevel} (分數: ${performanceScore})`);
        
        // 根據性能等級應用優化
        this.applyPerformanceOptimizations();
    }
    
    /**
     * 設置FPS監控
     */
    setupFPSMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.frameRate = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // 如果FPS過低，啟用優化
                if (this.metrics.frameRate < 30) {
                    this.enableRenderOptimization();
                }
            }
            
            if (this.isMonitoring) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        this.startFPSMonitoring = () => {
            this.isMonitoring = true;
            requestAnimationFrame(measureFPS);
        };
        
        this.stopFPSMonitoring = () => {
            this.isMonitoring = false;
        };
    }
    
    /**
     * 設置記憶體監控
     */
    setupMemoryMonitoring() {
        if (performance.memory) {
            this.monitoringInterval = setInterval(() => {
                const memoryInfo = performance.memory;
                this.metrics.memoryUsage = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
                
                // 如果記憶體使用過高，執行清理
                if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
                    this.performMemoryCleanup();
                }
            }, 5000);
        }
    }
    
    /**
     * 根據性能等級應用優化
     */
    applyPerformanceOptimizations() {
        switch (this.performanceLevel) {
            case 'low':
                this.enableAllOptimizations();
                break;
            case 'medium':
                this.enableModerateOptimizations();
                break;
            case 'high':
                // 高性能設備保持默認設置
                break;
        }
    }
    
    /**
     * 啟用所有優化
     */
    enableAllOptimizations() {
        this.optimizations.animationReduction = true;
        this.optimizations.renderOptimization = true;
        this.optimizations.memoryCleanup = true;
        this.optimizations.inputThrottling = true;
        
        console.log('🚀 啟用所有性能優化');
    }
    
    /**
     * 啟用適度優化
     */
    enableModerateOptimizations() {
        this.optimizations.animationReduction = false;
        this.optimizations.renderOptimization = true;
        this.optimizations.memoryCleanup = true;
        this.optimizations.inputThrottling = false;
        
        console.log('⚡ 啟用適度性能優化');
    }
    
    /**
     * 啟用渲染優化
     */
    enableRenderOptimization() {
        if (!this.optimizations.renderOptimization) {
            this.optimizations.renderOptimization = true;
            console.log('🎨 啟用渲染優化');
        }
    }
    
    /**
     * 執行記憶體清理
     */
    performMemoryCleanup() {
        if (this.optimizations.memoryCleanup) {
            // 觸發垃圾回收（如果可能）
            if (window.gc) {
                window.gc();
            }
            
            // 清理不必要的事件監聽器
            this.cleanupEventListeners();
            
            console.log('🧹 執行記憶體清理');
        }
    }
    
    /**
     * 清理事件監聽器
     */
    cleanupEventListeners() {
        // 這裡可以添加清理邏輯
        // 例如移除不再需要的事件監聽器
    }
    
    /**
     * 優化動畫性能
     * @param {Function} animationFunction - 動畫函數
     * @returns {Function} 優化後的動畫函數
     */
    optimizeAnimation(animationFunction) {
        if (this.optimizations.animationReduction) {
            // 減少動畫複雜度
            return this.createReducedAnimation(animationFunction);
        }
        
        return animationFunction;
    }
    
    /**
     * 創建簡化動畫
     * @param {Function} originalAnimation - 原始動畫函數
     * @returns {Function} 簡化的動畫函數
     */
    createReducedAnimation(originalAnimation) {
        return function(...args) {
            // 簡化動畫邏輯，例如減少幀數或使用CSS transforms
            const result = originalAnimation.apply(this, args);
            
            // 可以在這裡添加額外的優化邏輯
            return result;
        };
    }
    
    /**
     * 優化輸入處理
     * @param {Function} inputHandler - 輸入處理函數
     * @returns {Function} 優化後的輸入處理函數
     */
    optimizeInput(inputHandler) {
        if (this.optimizations.inputThrottling) {
            return this.throttle(inputHandler, 50); // 50ms節流
        }
        
        return inputHandler;
    }
    
    /**
     * 節流函數
     * @param {Function} func - 要節流的函數
     * @param {number} delay - 延遲時間
     * @returns {Function} 節流後的函數
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    }
    
    /**
     * 防抖函數
     * @param {Function} func - 要防抖的函數
     * @param {number} delay - 延遲時間
     * @returns {Function} 防抖後的函數
     */
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * 測量函數執行時間
     * @param {Function} func - 要測量的函數
     * @param {string} name - 函數名稱
     * @returns {Function} 包裝後的函數
     */
    measurePerformance(func, name) {
        return function(...args) {
            const startTime = performance.now();
            const result = func.apply(this, args);
            const endTime = performance.now();
            
            const executionTime = endTime - startTime;
            console.log(`⏱️ ${name} 執行時間: ${executionTime.toFixed(2)}ms`);
            
            return result;
        };
    }
    
    /**
     * 獲取性能報告
     * @returns {Object} 性能報告
     */
    getPerformanceReport() {
        return {
            devicePerformance: this.performanceLevel,
            metrics: { ...this.metrics },
            optimizations: { ...this.optimizations },
            thresholds: { ...this.thresholds },
            recommendations: this.getRecommendations()
        };
    }
    
    /**
     * 獲取性能建議
     * @returns {Array} 建議列表
     */
    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.frameRate < 30) {
            recommendations.push('考慮啟用渲染優化以提高幀率');
        }
        
        if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
            recommendations.push('記憶體使用過高，建議啟用記憶體清理');
        }
        
        if (this.metrics.inputLatency > this.thresholds.maxInputLatency) {
            recommendations.push('輸入延遲過高，建議啟用輸入節流');
        }
        
        if (this.performanceLevel === 'low') {
            recommendations.push('設備性能較低，建議啟用所有優化選項');
        }
        
        return recommendations;
    }
    
    /**
     * 開始性能監控
     */
    startMonitoring() {
        this.startFPSMonitoring();
        console.log('📊 開始性能監控');
    }
    
    /**
     * 停止性能監控
     */
    stopMonitoring() {
        this.stopFPSMonitoring();
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        console.log('⏹️ 停止性能監控');
    }
    
    /**
     * 銷毀性能優化器
     */
    destroy() {
        this.stopMonitoring();
        console.log('🗑️ 性能優化器已銷毀');
    }
}

// 在Node.js環境中導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}

// 瀏覽器環境下將類添加到全域範圍
if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
}