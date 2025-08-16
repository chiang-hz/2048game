// 調試分數計算問題
console.log('開始調試分數計算...');

// 檢查DOM元素
const scoreElement = document.getElementById('score');
console.log('分數元素:', scoreElement);
console.log('分數元素內容:', scoreElement ? scoreElement.textContent : 'null');

// 檢查遊戲引擎
if (typeof gameEngine !== 'undefined') {
    console.log('遊戲引擎存在');
    console.log('當前分數:', gameEngine.getScore());
    
    // 手動觸發分數更新
    if (typeof gameUI !== 'undefined') {
        console.log('遊戲UI存在');
        gameUI.updateScore();
        console.log('分數更新後，元素內容:', scoreElement.textContent);
    }
} else {
    console.log('遊戲引擎不存在');
}

// 監聽移動事件
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setTimeout(() => {
            console.log('移動後分數:', gameEngine ? gameEngine.getScore() : 'N/A');
            console.log('分數元素內容:', scoreElement ? scoreElement.textContent : 'N/A');
        }, 100);
    }
});