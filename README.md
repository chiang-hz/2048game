# 2048 網路遊戲

一個使用純JavaScript實現的經典2048拼圖遊戲的網頁版本。

## 功能特色

- 🎮 完整的2048遊戲邏輯
- 📱 響應式設計，支援桌面和移動設備
- ⌨️ 鍵盤控制（方向鍵或WASD）
- 👆 觸控手勢支援
- 🎨 流暢的動畫效果
- 📊 分數系統
- 🔄 重新開始功能

## 技術架構

### 核心類別

- **Board**: 管理4x4遊戲網格和方塊數據
- **MoveProcessor**: 處理方塊移動和合併邏輯
- **GameEngine**: 遊戲核心引擎，管理遊戲狀態
- **GameUI**: 用戶界面管理和渲染
- **InputHandler**: 處理鍵盤和觸控輸入

### 技術棧

- HTML5
- CSS3 (Flexbox/Grid)
- 純JavaScript (ES6+)
- Jest (測試框架)

## 快速開始

### 1. 克隆或下載項目

```bash
git clone <repository-url>
cd 2048-web-game
```

### 2. 安裝依賴（用於測試）

```bash
npm install
```

### 3. 運行遊戲

直接在瀏覽器中打開 `index.html` 文件，或使用本地服務器：

```bash
# 使用Python
npm run serve

# 或使用Node.js
npm run serve:node
```

### 4. 運行測試

```bash
# 運行所有測試
npm test

# 監視模式
npm run test:watch

# 生成覆蓋率報告
npm run test:coverage
```

## 遊戲規則

1. 使用方向鍵或滑動手勢移動方塊
2. 相同數字的方塊碰撞時會合併成一個數值加倍的方塊
3. 每次移動後會在隨機空位置生成新方塊（90%機率生成2，10%機率生成4）
4. 達到2048即獲勝
5. 無法移動且網格已滿時遊戲結束

## 控制方式

### 桌面設備
- 方向鍵：↑ ↓ ← →
- WASD鍵：W A S D

### 移動設備
- 滑動手勢：上下左右滑動

## 項目結構

```
2048-web-game/
├── index.html          # 主HTML文件
├── css/
│   └── styles.css      # 樣式文件
├── js/
│   ├── Board.js        # 遊戲板類
│   ├── MoveProcessor.js # 移動處理類
│   ├── GameEngine.js   # 遊戲引擎類
│   ├── GameUI.js       # 用戶界面類
│   ├── InputHandler.js # 輸入處理類
│   └── main.js         # 主應用程序
├── tests/
│   ├── setup.js        # 測試環境設置
│   └── *.test.js       # 測試文件
├── package.json        # 項目配置
└── README.md          # 項目說明
```

## 開發指南

### 添加新功能

1. 在相應的類中添加方法
2. 編寫對應的單元測試
3. 更新UI和樣式（如需要）
4. 運行測試確保功能正常

### 測試

項目使用Jest作為測試框架，測試文件位於 `tests/` 目錄中。

```bash
# 運行特定測試文件
npx jest tests/Board.test.js

# 運行測試並生成覆蓋率報告
npm run test:coverage
```

## 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 授權

MIT License

## 貢獻

歡迎提交Issue和Pull Request來改進這個項目。