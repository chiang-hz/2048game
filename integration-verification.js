/**
 * 集成驗證腳本 - 驗證所有組件是否正確集成
 * 這個腳本可以在瀏覽器控制台中運行來驗證集成狀態
 */

// 驗證所有必要的類是否存在
function verifyClassesExist() {
    const requiredClasses = [
        'Board',
        'GameEngine', 
        'GameUI',
        'InputHandler',
        'MoveProcessor',
        'PerformanceOptimizer'
    ];
    
    const missingClasses = [];
    
    for (const className of requiredClasses) {
        if (typeof window[className] === 'undefined') {
            missingClasses.push(className);
        }
    }
    
    if (missingClasses.length > 0) {
        console.error('❌ 缺少必要的類:', missingClasses);
        return false;
    }
    
    console.log('✅ 所有必要的類都已載入');
    return true;
}

// 驗證DOM元素是否存在
function verifyDOMElements() {
    const requiredElements = [
        'game-board',
        'score', 
        'game-message',
        'message-text',
        'restart',
        'try-again'
    ];
    
    const missingElements = [];
    
    for (const elementId of requiredElements) {
        if (!document.getElementById(elementId)) {
            missingElements.push(elementId);
        }
    }
    
    if (missingElements.length > 0) {
        console.error('❌ 缺少必要的DOM元素:', missingElements);
        return false;
    }
    
    console.log('✅ 所有必要的DOM元素都存在');
    return true;
}

// 驗證組件實例是否正確創建
function verifyComponentInstances() {
    if (!window.gameEngine || !window.gameUI || !window.inputHandler) {
        console.error('❌ 組件實例未正確創建');
        return false;
    }
    
    console.log('✅ 所有組件實例都已創建');
    return true;
}

// 驗證組件間的連接
function verifyComponentConnections() {
    const connections = [
        {
            name: 'GameUI -> GameEngine',
            test: () => window.gameUI && window.gameUI.gameEngine === window.gameEngine
        },
        {
            name: 'InputHandler -> GameUI', 
            test: () => window.inputHandler && window.inputHandler.gameUI === window.gameUI
        }
    ];
    
    const failedConnections = [];
    
    for (const connection of connections) {
        if (!connection.test()) {
            failedConnections.push(connection.name);
        }
    }
    
    if (failedConnections.length > 0) {
        console.error('❌ 組件連接失敗:', failedConnections);
        return false;
    }
    
    console.log('✅ 所有組件連接正常');
    return true;
}

// 驗證基本功能
function verifyBasicFunctionality() {
    try {
        // 測試遊戲引擎基本功能
        const initialScore = window.gameEngine.getScore();
        const initialBoard = window.gameEngine.getBoard();
        
        if (typeof initialScore !== 'number' || !initialBoard) {
            throw new Error('遊戲引擎基本功能異常');
        }
        
        // 測試UI渲染
        if (typeof window.gameUI.render !== 'function') {
            throw new Error('UI渲染功能缺失');
        }
        
        // 測試輸入處理
        if (typeof window.inputHandler.handleMove !== 'function') {
            throw new Error('輸入處理功能缺失');
        }
        
        console.log('✅ 基本功能驗證通過');
        return true;
        
    } catch (error) {
        console.error('❌ 基本功能驗證失敗:', error.message);
        return false;
    }
}

// 驗證應用程序狀態
function verifyAppState() {
    if (!window.appState || !window.appState.isInitialized) {
        console.error('❌ 應用程序未正確初始化');
        return false;
    }
    
    console.log('✅ 應用程序狀態正常');
    console.log('📊 應用程序狀態:', {
        初始化狀態: window.appState.isInitialized,
        初始化時間: window.appState.initializationTime,
        錯誤計數: window.appState.errorCount,
        組件健康狀態: window.appState.componentHealth
    });
    return true;
}

// 主驗證函數
function runIntegrationVerification() {
    console.log('🔍 開始集成驗證...');
    console.log('=====================================');
    
    const checks = [
        { name: '類存在性檢查', fn: verifyClassesExist },
        { name: 'DOM元素檢查', fn: verifyDOMElements },
        { name: '組件實例檢查', fn: verifyComponentInstances },
        { name: '組件連接檢查', fn: verifyComponentConnections },
        { name: '基本功能檢查', fn: verifyBasicFunctionality },
        { name: '應用程序狀態檢查', fn: verifyAppState }
    ];
    
    let passedChecks = 0;
    
    for (const check of checks) {
        console.log(`\n🔍 執行 ${check.name}...`);
        if (check.fn()) {
            passedChecks++;
        }
    }
    
    console.log('\n=====================================');
    console.log(`📋 驗證結果: ${passedChecks}/${checks.length} 項檢查通過`);
    
    if (passedChecks === checks.length) {
        console.log('🎉 所有集成驗證通過！遊戲已準備就緒。');
        return true;
    } else {
        console.log('⚠️ 部分驗證失敗，請檢查上述錯誤。');
        return false;
    }
}

// 如果在瀏覽器環境中，自動運行驗證
if (typeof window !== 'undefined') {
    // 等待DOM載入完成後運行驗證
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runIntegrationVerification, 1000);
        });
    } else {
        setTimeout(runIntegrationVerification, 1000);
    }
}

// 導出驗證函數供手動調用
if (typeof window !== 'undefined') {
    window.runIntegrationVerification = runIntegrationVerification;
}