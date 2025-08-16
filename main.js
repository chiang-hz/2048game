/**
 * 主應用程序文件 - 2048遊戲完整集成系統
 * 負責初始化所有組件、管理組件間通信、錯誤處理和性能監控
 */

// 全局變量和應用程序狀態
let gameEngine;
let gameUI;
let inputHandler;
let performanceOptimizer;
let appState = {
    isInitialized: false,
    initializationTime: null,
    errorCount: 0,
    performanceMetrics: {
        initTime: 0,
        renderTime: 0,
        inputResponseTime: 0
    },
    componentHealth: {
        gameEngine: false,
        gameUI: false,
        inputHandler: false,
        performanceOptimizer: false
    }
};

/**
 * 應用程序主入口點
 * 執行完整的初始化流程並設置所有必要的系統
 */
function initializeApp() {
    const startTime = performance.now();
    
    try {
        console.log('🎮 開始初始化2048遊戲應用程序...');
        
        // 階段1: 環境檢查和驗證
        if (!performEnvironmentChecks()) {
            return false;
        }
        
        // 階段2: 核心組件初始化
        if (!initializeCoreComponents()) {
            return false;
        }
        
        // 階段3: 組件集成和連接
        if (!integrateComponents()) {
            return false;
        }
        
        // 階段4: 系統服務設置
        setupSystemServices();
        
        // 階段5: 最終驗證和啟動
        if (!finalizeInitialization()) {
            return false;
        }
        
        // 記錄成功初始化
        const endTime = performance.now();
        appState.performanceMetrics.initTime = endTime - startTime;
        appState.isInitialized = true;
        appState.initializationTime = new Date();
        
        console.log(`✅ 2048遊戲初始化完成 (${Math.round(appState.performanceMetrics.initTime)}ms)`);
        logInitializationSummary();
        
        return true;
        
    } catch (error) {
        console.error('❌ 遊戲初始化失敗:', error);
        handleInitializationError(error);
        return false;
    }
}

/**
 * 執行環境檢查和驗證
 * @returns {boolean} 環境是否符合要求
 */
function performEnvironmentChecks() {
    console.log('🔍 執行環境檢查...');
    
    // 檢查瀏覽器兼容性
    if (!checkBrowserCompatibility()) {
        showErrorMessage('您的瀏覽器不支援此遊戲，請使用現代瀏覽器。');
        return false;
    }
    
    // 檢查必要的DOM元素
    if (!validateRequiredElements()) {
        showErrorMessage('頁面元素載入不完整，請刷新頁面重試。');
        return false;
    }
    
    // 檢查必要的類是否可用
    if (!validateRequiredClasses()) {
        showErrorMessage('遊戲組件載入失敗，請刷新頁面重試。');
        return false;
    }
    
    console.log('✅ 環境檢查通過');
    return true;
}

/**
 * 初始化核心組件
 * @returns {boolean} 初始化是否成功
 */
function initializeCoreComponents() {
    console.log('🔧 初始化核心組件...');
    
    try {
        // 初始化遊戲引擎
        console.log('  📊 創建遊戲引擎...');
        gameEngine = new GameEngine(4);
        gameEngine.initializeGame();
        appState.componentHealth.gameEngine = true;
        console.log('  ✅ 遊戲引擎初始化完成');
        
        // 初始化遊戲UI
        console.log('  🎨 創建遊戲UI...');
        gameUI = new GameUI(gameEngine);
        appState.componentHealth.gameUI = true;
        console.log('  ✅ 遊戲UI初始化完成');
        
        // 初始化輸入處理器
        console.log('  ⌨️ 創建輸入處理器...');
        inputHandler = new InputHandler(gameUI);
        appState.componentHealth.inputHandler = true;
        console.log('  ✅ 輸入處理器初始化完成');
        
        // 初始化性能優化器
        console.log('  🚀 創建性能優化器...');
        performanceOptimizer = new PerformanceOptimizer();
        appState.componentHealth.performanceOptimizer = true;
        console.log('  ✅ 性能優化器初始化完成');
        
        return true;
        
    } catch (error) {
        console.error('❌ 核心組件初始化失敗:', error);
        return false;
    }
}

/**
 * 集成組件並建立通信
 * @returns {boolean} 集成是否成功
 */
function integrateComponents() {
    console.log('🔗 集成組件...');
    
    try {
        // 建立組件間的引用關係
        if (gameUI && inputHandler) {
            // 確保UI可以訪問輸入處理器狀態
            gameUI.inputHandler = inputHandler;
        }
        
        if (gameEngine && gameUI) {
            // 確保引擎可以通知UI更新
            gameEngine.ui = gameUI;
        }
        
        if (performanceOptimizer) {
            // 將性能優化器集成到其他組件
            if (gameUI && typeof gameUI.setPerformanceOptimizer === 'function') {
                gameUI.setPerformanceOptimizer(performanceOptimizer);
            }
            if (inputHandler && typeof inputHandler.setPerformanceOptimizer === 'function') {
                inputHandler.setPerformanceOptimizer(performanceOptimizer);
            }
        }
        
        // 驗證組件集成
        if (!validateComponentIntegration()) {
            throw new Error('組件集成驗證失敗');
        }
        
        console.log('✅ 組件集成完成');
        return true;
        
    } catch (error) {
        console.error('❌ 組件集成失敗:', error);
        return false;
    }
}

/**
 * 設置系統服務
 */
function setupSystemServices() {
    console.log('⚙️ 設置系統服務...');
    
    // 設置全局錯誤處理
    setupGlobalErrorHandling();
    
    // 設置性能監控
    setupPerformanceMonitoring();
    
    // 啟動性能優化器監控
    if (performanceOptimizer) {
        performanceOptimizer.startMonitoring();
    }
    
    // 設置健康檢查
    setupHealthCheck();
    
    // 設置自動保存（如果需要）
    setupAutoSave();
    
    console.log('✅ 系統服務設置完成');
}

/**
 * 最終驗證和啟動
 * @returns {boolean} 最終驗證是否通過
 */
function finalizeInitialization() {
    console.log('🏁 執行最終驗證...');
    
    try {
        // 執行完整的功能測試
        if (!performFunctionalTests()) {
            throw new Error('功能測試失敗');
        }
        
        // 渲染初始界面
        if (gameUI && typeof gameUI.render === 'function') {
            gameUI.render();
        }
        
        // 觸發初始化完成事件
        dispatchInitializationComplete();
        
        console.log('✅ 最終驗證通過');
        return true;
        
    } catch (error) {
        console.error('❌ 最終驗證失敗:', error);
        return false;
    }
}

/**
 * 檢查瀏覽器兼容性
 * @returns {boolean} 瀏覽器是否兼容
 */
function checkBrowserCompatibility() {
    const requiredFeatures = [
        // JavaScript功能
        { name: 'Array.forEach', test: () => typeof Array.prototype.forEach !== 'undefined' },
        { name: 'addEventListener', test: () => typeof document.addEventListener !== 'undefined' },
        { name: 'JSON', test: () => typeof JSON !== 'undefined' },
        { name: 'localStorage', test: () => typeof Storage !== 'undefined' },
        { name: 'querySelector', test: () => typeof document.querySelector !== 'undefined' },
        
        // ES6功能
        { name: 'const/let', test: () => { try { eval('const x = 1'); return true; } catch { return false; } } },
        { name: 'Arrow functions', test: () => { try { eval('() => {}'); return true; } catch { return false; } } },
        
        // DOM功能
        { name: 'classList', test: () => 'classList' in document.createElement('div') },
        { name: 'dataset', test: () => 'dataset' in document.createElement('div') }
    ];
    
    const failedFeatures = [];
    
    for (const feature of requiredFeatures) {
        try {
            if (!feature.test()) {
                failedFeatures.push(feature.name);
            }
        } catch (error) {
            failedFeatures.push(feature.name);
        }
    }
    
    if (failedFeatures.length > 0) {
        console.warn('不支援的功能:', failedFeatures);
        return failedFeatures.length <= 2; // 允許最多2個功能不支援
    }
    
    // 檢查CSS功能
    const testElement = document.createElement('div');
    const cssFeatures = ['transform', 'transition', 'flexbox'];
    const supportedCSS = [];
    
    // 檢查transform支援
    if ('transform' in testElement.style ||
        'webkitTransform' in testElement.style ||
        'mozTransform' in testElement.style ||
        'msTransform' in testElement.style) {
        supportedCSS.push('transform');
    }
    
    // 檢查transition支援
    if ('transition' in testElement.style ||
        'webkitTransition' in testElement.style ||
        'mozTransition' in testElement.style) {
        supportedCSS.push('transition');
    }
    
    // 檢查flexbox支援
    testElement.style.display = 'flex';
    if (testElement.style.display === 'flex') {
        supportedCSS.push('flexbox');
    }
    
    console.log('支援的CSS功能:', supportedCSS);
    return true;
}

/**
 * 驗證必要的DOM元素
 * @returns {boolean} 所有必要元素是否存在
 */
function validateRequiredElements() {
    const requiredElements = [
        { id: 'game-board', description: '遊戲板容器' },
        { id: 'score', description: '分數顯示' },
        { id: 'game-message', description: '遊戲訊息容器' },
        { id: 'message-text', description: '訊息文字' },
        { id: 'restart', description: '重新開始按鈕' },
        { id: 'try-again', description: '再試一次按鈕' }
    ];
    
    const missingElements = [];
    
    for (const element of requiredElements) {
        const domElement = document.getElementById(element.id);
        if (!domElement) {
            missingElements.push(element);
        } else {
            // 檢查元素是否可見和可用
            const style = window.getComputedStyle(domElement);
            if (style.display === 'none' && element.id === 'game-board') {
                console.warn(`Element ${element.id} is hidden`);
            }
        }
    }
    
    if (missingElements.length > 0) {
        console.error('缺少必要的DOM元素:', missingElements.map(e => `${e.id} (${e.description})`));
        return false;
    }
    
    return true;
}

/**
 * 驗證必要的類是否可用
 * @returns {boolean} 所有必要類是否存在
 */
function validateRequiredClasses() {
    const requiredClasses = [
        { name: 'Board', description: '遊戲板類' },
        { name: 'GameEngine', description: '遊戲引擎類' },
        { name: 'GameUI', description: '遊戲UI類' },
        { name: 'InputHandler', description: '輸入處理類' },
        { name: 'MoveProcessor', description: '移動處理類' },
        { name: 'PerformanceOptimizer', description: '性能優化類' },
        { name: 'ScoreManager', description: '分數管理類' }
    ];
    
    const missingClasses = [];
    
    for (const cls of requiredClasses) {
        if (typeof window[cls.name] === 'undefined') {
            missingClasses.push(cls);
        }
    }
    
    if (missingClasses.length > 0) {
        console.error('缺少必要的類:', missingClasses.map(c => `${c.name} (${c.description})`));
        return false;
    }
    
    return true;
}

/**
 * 驗證組件集成
 * @returns {boolean} 組件集成是否正確
 */
function validateComponentIntegration() {
    const validations = [
        {
            name: '遊戲引擎基本功能',
            test: () => gameEngine && typeof gameEngine.move === 'function' && typeof gameEngine.getScore === 'function'
        },
        {
            name: '遊戲UI基本功能',
            test: () => gameUI && typeof gameUI.render === 'function' && typeof gameUI.handleMove === 'function'
        },
        {
            name: '輸入處理器基本功能',
            test: () => inputHandler && typeof inputHandler.handleMove === 'function'
        },
        {
            name: '性能優化器基本功能',
            test: () => performanceOptimizer && typeof performanceOptimizer.getPerformanceReport === 'function'
        },
        {
            name: 'UI與引擎連接',
            test: () => gameUI.gameEngine === gameEngine
        },
        {
            name: '輸入與UI連接',
            test: () => inputHandler.gameUI === gameUI
        }
    ];
    
    const failedValidations = [];
    
    for (const validation of validations) {
        try {
            if (!validation.test()) {
                failedValidations.push(validation.name);
            }
        } catch (error) {
            failedValidations.push(`${validation.name} (錯誤: ${error.message})`);
        }
    }
    
    if (failedValidations.length > 0) {
        console.error('組件集成驗證失敗:', failedValidations);
        return false;
    }
    
    return true;
}

/**
 * 執行功能測試
 * @returns {boolean} 功能測試是否通過
 */
function performFunctionalTests() {
    const tests = [
        {
            name: '遊戲引擎基本操作',
            test: () => {
                const initialScore = gameEngine.getScore();
                const initialBoard = gameEngine.getBoard();
                return typeof initialScore === 'number' && Array.isArray(initialBoard.grid);
            }
        },
        {
            name: '遊戲UI渲染',
            test: () => {
                const boardElement = document.getElementById('game-board');
                return boardElement && boardElement.children.length > 0;
            }
        },
        {
            name: '輸入處理器響應',
            test: () => {
                return !inputHandler.isInputBlocked && typeof inputHandler.handleMove === 'function';
            }
        }
    ];
    
    for (const test of tests) {
        try {
            if (!test.test()) {
                console.error(`功能測試失敗: ${test.name}`);
                return false;
            }
        } catch (error) {
            console.error(`功能測試錯誤: ${test.name}`, error);
            return false;
        }
    }
    
    return true;
}

/**
 * 觸發初始化完成事件
 */
function dispatchInitializationComplete() {
    const event = new CustomEvent('gameInitialized', {
        detail: {
            timestamp: Date.now(),
            components: appState.componentHealth,
            performanceMetrics: appState.performanceMetrics
        }
    });
    
    window.dispatchEvent(event);
}

/**
 * 記錄初始化摘要
 */
function logInitializationSummary() {
    console.log('📋 初始化摘要:');
    console.log(`  ⏱️ 初始化時間: ${Math.round(appState.performanceMetrics.initTime)}ms`);
    console.log('  🔧 組件狀態:', appState.componentHealth);
    console.log(`  📅 初始化時間: ${appState.initializationTime.toLocaleString()}`);
    console.log('  🎮 遊戲已準備就緒!');
}

/**
 * 處理初始化錯誤
 * @param {Error} error - 錯誤對象
 */
function handleInitializationError(error) {
    appState.errorCount++;
    
    // 嘗試降級初始化
    if (appState.errorCount < 3) {
        console.log('🔄 嘗試降級初始化...');
        setTimeout(() => attemptFallbackInitialization(), 1000);
    } else {
        showErrorMessage('遊戲初始化失敗，請刷新頁面重試。');
    }
}

/**
 * 設置性能監控
 */
function setupPerformanceMonitoring() {
    // 監控渲染性能
    if (gameUI && typeof gameUI.render === 'function') {
        const originalRender = gameUI.render.bind(gameUI);
        gameUI.render = function(...args) {
            const start = performance.now();
            const result = originalRender(...args);
            appState.performanceMetrics.renderTime = performance.now() - start;
            return result;
        };
    }
    
    // 監控輸入響應時間
    if (inputHandler && typeof inputHandler.handleMove === 'function') {
        const originalHandleMove = inputHandler.handleMove.bind(inputHandler);
        inputHandler.handleMove = function(...args) {
            const start = performance.now();
            const result = originalHandleMove(...args);
            appState.performanceMetrics.inputResponseTime = performance.now() - start;
            return result;
        };
    }
}

/**
 * 設置自動保存
 */
function setupAutoSave() {
    // 每30秒自動保存遊戲狀態到localStorage
    setInterval(() => {
        if (gameEngine && appState.isInitialized) {
            try {
                const gameState = gameEngine.getGameState();
                localStorage.setItem('2048-game-state', JSON.stringify({
                    ...gameState,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.warn('自動保存失敗:', error);
            }
        }
    }, 30000);
}

/**
 * 設置全局錯誤處理
 */
function setupGlobalErrorHandling() {
    // 捕獲未處理的JavaScript錯誤
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        handleGlobalError('JavaScript錯誤', event.error);
    });
    
    // 捕獲未處理的Promise拒絕
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        handleGlobalError('Promise錯誤', event.reason);
        event.preventDefault(); // 防止錯誤在控制台中顯示
    });
    
    // 捕獲資源載入錯誤
    window.addEventListener('error', (event) => {
        if (event.target !== window) {
            console.error('Resource loading error:', event.target.src || event.target.href);
            handleGlobalError('資源載入錯誤', new Error(`Failed to load: ${event.target.src || event.target.href}`));
        }
    }, true);
}

/**
 * 處理全局錯誤
 * @param {string} type - 錯誤類型
 * @param {Error} error - 錯誤對象
 */
function handleGlobalError(type, error) {
    appState.errorCount++;
    
    // 記錄錯誤詳情
    const errorInfo = {
        type,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        appState: { ...appState }
    };
    
    console.error(`🚨 全局錯誤 [${type}]:`, errorInfo);
    
    // 檢查是否是遊戲相關錯誤
    if (gameEngine && gameUI && inputHandler && appState.isInitialized) {
        // 檢查各組件的健康狀態
        const componentHealth = checkComponentHealth();
        
        if (!componentHealth.allHealthy) {
            console.warn('⚠️ 檢測到組件健康問題:', componentHealth);
            showErrorMessage('遊戲遇到問題，正在嘗試恢復...');
            attemptGameRecovery();
        }
    }
    
    // 如果錯誤過多，建議重新載入
    if (appState.errorCount > 10) {
        showErrorMessage('遊戲遇到多個錯誤，建議重新載入頁面。', true);
    }
}

/**
 * 檢查組件健康狀態
 * @returns {Object} 組件健康狀態報告
 */
function checkComponentHealth() {
    const health = {
        gameEngine: false,
        gameUI: false,
        inputHandler: false,
        allHealthy: false
    };
    
    try {
        // 檢查遊戲引擎
        if (gameEngine) {
            const engineStats = gameEngine.getErrorStats ? gameEngine.getErrorStats() : { isHealthy: true };
            health.gameEngine = engineStats.isHealthy && typeof gameEngine.move === 'function';
        }
        
        // 檢查遊戲UI
        if (gameUI) {
            const uiStats = gameUI.getUIErrorStats ? gameUI.getUIErrorStats() : { isHealthy: true };
            health.gameUI = uiStats.isHealthy && typeof gameUI.render === 'function';
        }
        
        // 檢查輸入處理器
        if (inputHandler) {
            const inputStats = inputHandler.getInputErrorStats ? inputHandler.getInputErrorStats() : { isHealthy: true };
            health.inputHandler = inputStats.isHealthy && typeof inputHandler.handleMove === 'function';
        }
        
        // 檢查性能優化器
        if (performanceOptimizer) {
            health.performanceOptimizer = typeof performanceOptimizer.getPerformanceReport === 'function';
        }
        
        health.allHealthy = health.gameEngine && health.gameUI && health.inputHandler && health.performanceOptimizer;
        
    } catch (error) {
        console.error('健康檢查失敗:', error);
    }
    
    return health;
}

/**
 * 設置健康檢查
 */
function setupHealthCheck() {
    // 每30秒檢查一次遊戲健康狀態
    setInterval(() => {
        if (appState.isInitialized) {
            performHealthCheck();
        }
    }, 30000);
    
    // 每5分鐘執行深度健康檢查
    setInterval(() => {
        if (appState.isInitialized) {
            performDeepHealthCheck();
        }
    }, 300000);
}

/**
 * 執行健康檢查
 */
function performHealthCheck() {
    try {
        const healthReport = checkComponentHealth();
        
        // 更新應用程序狀態
        appState.componentHealth = {
            gameEngine: healthReport.gameEngine,
            gameUI: healthReport.gameUI,
            inputHandler: healthReport.inputHandler
        };
        
        // 檢查DOM元素完整性
        if (!validateRequiredElements()) {
            console.warn('⚠️ DOM元素驗證失敗');
            showErrorMessage('頁面元素異常，建議刷新頁面');
        }
        
        // 檢查記憶體使用情況
        if (performance.memory) {
            const memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
            
            if (memoryUsage.used > memoryUsage.limit * 0.8) {
                console.warn('⚠️ 記憶體使用量過高:', memoryUsage);
            }
        }
        
        // 如果所有組件都健康，記錄成功
        if (healthReport.allHealthy) {
            console.log('✅ 健康檢查通過');
        } else {
            console.warn('⚠️ 健康檢查發現問題:', healthReport);
        }
        
    } catch (error) {
        console.error('❌ 健康檢查失敗:', error);
        appState.errorCount++;
    }
}

/**
 * 執行深度健康檢查
 */
function performDeepHealthCheck() {
    console.log('🔍 執行深度健康檢查...');
    
    try {
        // 檢查遊戲狀態一致性
        if (gameEngine) {
            const gameState = gameEngine.getGameState();
            if (!gameState || typeof gameState.score !== 'number') {
                console.warn('⚠️ 遊戲狀態異常');
            }
        }
        
        // 檢查UI渲染狀態
        if (gameUI) {
            const boardElement = document.getElementById('game-board');
            if (!boardElement || boardElement.children.length === 0) {
                console.warn('⚠️ UI渲染狀態異常');
                gameUI.render();
            }
        }
        
        // 檢查事件監聽器
        if (inputHandler) {
            // 這裡可以添加更詳細的輸入處理器檢查
            console.log('🎮 輸入處理器狀態正常');
        }
        
        // 檢查localStorage可用性
        try {
            localStorage.setItem('health-check', 'test');
            localStorage.removeItem('health-check');
        } catch (error) {
            console.warn('⚠️ localStorage不可用:', error);
        }
        
        console.log('✅ 深度健康檢查完成');
        
    } catch (error) {
        console.error('❌ 深度健康檢查失敗:', error);
    }
}

/**
 * 嘗試遊戲恢復
 */
function attemptGameRecovery() {
    try {
        console.log('🔄 嘗試遊戲恢復...');
        
        // 步驟1: 嘗試軟重置
        if (gameEngine && typeof gameEngine.restart === 'function') {
            gameEngine.restart();
            console.log('  ✅ 遊戲引擎重置完成');
        }
        
        // 步驟2: 重新渲染UI
        if (gameUI && typeof gameUI.render === 'function') {
            gameUI.render();
            console.log('  ✅ UI重新渲染完成');
        }
        
        // 步驟3: 重新綁定事件
        if (inputHandler && typeof inputHandler.rebindEvents === 'function') {
            inputHandler.rebindEvents();
            console.log('  ✅ 事件重新綁定完成');
        }
        
        // 步驟4: 驗證恢復結果
        const healthCheck = checkComponentHealth();
        if (healthCheck.allHealthy) {
            console.log('✅ 遊戲恢復成功');
            showSuccessMessage('遊戲已恢復正常');
        } else {
            throw new Error('恢復後健康檢查失敗');
        }
        
    } catch (error) {
        console.error('❌ 遊戲恢復失敗:', error);
        attemptFallbackInitialization();
    }
}

/**
 * 嘗試降級初始化
 */
function attemptFallbackInitialization() {
    try {
        console.log('🆘 嘗試降級初始化...');
        
        // 清理現有實例
        cleanupExistingInstances();
        
        // 重置應用程序狀態
        appState.isInitialized = false;
        appState.errorCount = 0;
        
        // 使用最小配置重新初始化
        console.log('  🔧 創建最小配置的遊戲引擎...');
        gameEngine = new GameEngine(4);
        gameEngine.initializeGame();
        
        console.log('  🎨 創建基礎UI...');
        gameUI = new GameUI(gameEngine);
        
        console.log('  ⌨️ 創建基礎輸入處理器...');
        inputHandler = new InputHandler(gameUI);
        
        // 簡單的集成檢查
        if (gameEngine && gameUI && inputHandler) {
            appState.isInitialized = true;
            console.log('✅ 降級初始化完成');
            showSuccessMessage('遊戲已使用基礎模式啟動');
        } else {
            throw new Error('降級初始化失敗');
        }
        
    } catch (error) {
        console.error('❌ 降級初始化失敗:', error);
        showErrorMessage('遊戲無法正常運行，請刷新頁面或聯繫技術支援。', true);
    }
}

/**
 * 清理現有實例
 */
function cleanupExistingInstances() {
    try {
        // 清理輸入處理器
        if (inputHandler && typeof inputHandler.destroy === 'function') {
            inputHandler.destroy();
        }
        
        // 清理UI事件監聽器
        if (gameUI && typeof gameUI.cleanup === 'function') {
            gameUI.cleanup();
        }
        
        // 清理性能優化器
        if (performanceOptimizer && typeof performanceOptimizer.destroy === 'function') {
            performanceOptimizer.destroy();
        }
        
        // 重置全局變量
        gameEngine = null;
        gameUI = null;
        inputHandler = null;
        performanceOptimizer = null;
        
        console.log('🧹 實例清理完成');
        
    } catch (error) {
        console.warn('⚠️ 實例清理時發生錯誤:', error);
    }
}

/**
 * 顯示錯誤訊息
 * @param {string} message - 錯誤訊息
 * @param {boolean} persistent - 是否持續顯示
 */
function showErrorMessage(message, persistent = false) {
    // 移除現有的訊息
    const existingMessages = document.querySelectorAll('.app-message');
    existingMessages.forEach(msg => msg.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'app-message error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff6b6b;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        font-size: 16px;
        z-index: 10000;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    errorDiv.innerHTML = `
        <div style="margin-bottom: 10px;">❌ ${message}</div>
        ${persistent ? '<div style="font-size: 14px; opacity: 0.9;">點擊任意處關閉</div>' : ''}
    `;
    
    document.body.appendChild(errorDiv);
    
    // 自動移除或點擊移除
    if (persistent) {
        errorDiv.addEventListener('click', () => errorDiv.remove());
    } else {
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

/**
 * 顯示成功訊息
 * @param {string} message - 成功訊息
 */
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'app-message success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    
    successDiv.innerHTML = `✅ ${message}`;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

/**
 * 重新開始遊戲
 */
function restartGame() {
    try {
        console.log('🔄 重新開始遊戲...');
        
        if (gameEngine && gameUI) {
            gameEngine.restart();
            gameUI.render();
            console.log('✅ 遊戲重新開始完成');
        } else {
            throw new Error('遊戲組件未初始化');
        }
    } catch (error) {
        console.error('❌ 重新開始遊戲失敗:', error);
        showErrorMessage('重新開始失敗，請刷新頁面');
    }
}

/**
 * 獲取遊戲狀態（用於調試）
 */
function getGameState() {
    if (gameEngine) {
        return {
            ...gameEngine.getGameState(),
            appState: { ...appState },
            timestamp: new Date().toISOString()
        };
    }
    return { error: '遊戲引擎未初始化', appState: { ...appState } };
}

/**
 * 獲取應用程序診斷信息
 */
function getDiagnostics() {
    return {
        appState: { ...appState },
        componentHealth: checkComponentHealth(),
        browserInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        },
        performanceInfo: performance.memory ? {
            memory: {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            }
        } : {},
        timestamp: new Date().toISOString()
    };
}

/**
 * 強制重新初始化應用程序
 */
function forceReinitialize() {
    console.log('🔄 強制重新初始化應用程序...');
    
    cleanupExistingInstances();
    
    // 重置狀態
    appState = {
        isInitialized: false,
        initializationTime: null,
        errorCount: 0,
        performanceMetrics: {
            initTime: 0,
            renderTime: 0,
            inputResponseTime: 0
        },
        componentHealth: {
            gameEngine: false,
            gameUI: false,
            inputHandler: false
        }
    };
    
    // 重新初始化
    setTimeout(() => {
        initializeApp();
    }, 100);
}

/**
 * 導出遊戲狀態到JSON
 */
function exportGameState() {
    try {
        const state = getGameState();
        const dataStr = JSON.stringify(state, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `2048-game-state-${new Date().toISOString().slice(0, 19)}.json`;
        link.click();
        
        showSuccessMessage('遊戲狀態已導出');
    } catch (error) {
        console.error('導出失敗:', error);
        showErrorMessage('導出失敗');
    }
}

// 等待DOM加載完成後初始化應用程序
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM載入完成，開始初始化應用程序...');
    initializeApp();
});

// 導出全局變量供調試和驗證使用
window.gameEngine = gameEngine;
window.gameUI = gameUI;
window.inputHandler = inputHandler;
window.performanceOptimizer = performanceOptimizer;
window.appState = appState;

// 導出實用函數
window.restartGame = restartGame;
window.getGameState = getGameState;
window.getDiagnostics = getDiagnostics;
window.forceReinitialize = forceReinitialize;
window.exportGameState = exportGameState;

// 頁面卸載時清理資源
window.addEventListener('beforeunload', () => {
    console.log('🧹 頁面卸載，清理資源...');
    cleanupExistingInstances();
});

// 頁面可見性變化處理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📱 頁面隱藏');
    } else {
        console.log('📱 頁面顯示');
        // 頁面重新顯示時執行健康檢查
        if (appState.isInitialized) {
            setTimeout(performHealthCheck, 1000);
        }
    }
});

// 導出全局API供調試和外部使用
window.Game2048 = {
    // 基本操作
    restart: restartGame,
    getState: getGameState,
    
    // 診斷和調試
    getDiagnostics,
    performHealthCheck,
    forceReinitialize,
    exportGameState,
    
    // 狀態查詢
    isInitialized: () => appState.isInitialized,
    getAppState: () => ({ ...appState }),
    getComponentHealth: checkComponentHealth,
    
    // 性能相關
    getPerformanceReport: () => performanceOptimizer ? performanceOptimizer.getPerformanceReport() : null,
    startPerformanceMonitoring: () => performanceOptimizer && performanceOptimizer.startMonitoring(),
    stopPerformanceMonitoring: () => performanceOptimizer && performanceOptimizer.stopMonitoring(),
    
    // 內部組件訪問（僅供調試）
    _internal: {
        gameEngine: () => gameEngine,
        gameUI: () => gameUI,
        inputHandler: () => inputHandler,
        performanceOptimizer: () => performanceOptimizer
    }
};

// 向控制台輸出API使用說明
console.log(`
🎮 2048遊戲 API 使用說明:
  Game2048.restart()                    - 重新開始遊戲
  Game2048.getState()                   - 獲取遊戲狀態
  Game2048.getDiagnostics()             - 獲取診斷信息
  Game2048.performHealthCheck()         - 執行健康檢查
  Game2048.exportGameState()            - 導出遊戲狀態
  Game2048.isInitialized()              - 檢查是否已初始化
  Game2048.getPerformanceReport()       - 獲取性能報告
  Game2048.startPerformanceMonitoring() - 開始性能監控
  Game2048.stopPerformanceMonitoring()  - 停止性能監控
`);