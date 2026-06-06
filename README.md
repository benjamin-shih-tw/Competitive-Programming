# 🚀 Competitive Programming Solutions & Portal

本專案收集了演算法競賽的解題紀錄與題解，並建立了精美的 CSES 題解入口網站。
[WEB](https://benjamin-shih-tw.github.io/Competitive-Programming/)

![AtCoder Rating](https://atrating.baoshuo.dev/rating?username=benjaminshih2)

---

## 📂 專案目錄結構

專案採用子目錄封裝與重構，將各部分妥善分類：

*   **[`cses/`](file:///Users/benjamin/.gemini/antigravity/scratch/Competitive-Programming/cses)**：CSES 題解入口網站專區。
    *   `sync_cses.py`：本機/伺服器端 CSES 解題狀態與代碼自動同步工具。
    *   `website/`：採用 Next.js 15 + React 19 與 Notion API 打造的雙欄精美題解網站。
    *   `*.cpp`：已同步的 CSES AC 解題代碼（本機端透過 Git `sparse-checkout` 預設隱藏以保持工作區乾淨，僅顯示 `Untitled-3.cpp` 供日常編寫）。
*   **[`other/`](file:///Users/benjamin/.gemini/antigravity/scratch/Competitive-Programming/other)**：封存原有主分支（`main`）的相關檔案。

---

## 🛠️ 日常解題與發佈 SOP (標準作業流程)

未來您在 CSES 寫過新題目後，請遵循以下步驟同步代碼與更新網頁：

### 步驟 1：在 CSES 上解題
* 您可以直接在本機工作區的 `cses/Untitled-3.cpp` 寫 code，或直接在 CSES 網頁上解題並取得 **AC (Accepted)**。

### 步驟 2：同步 AC 代碼至 GitHub (本機端)
打開您的終端機，執行以下指令：
```bash
cd /Users/benjamin/.gemini/antigravity/scratch/Competitive-Programming
python3 cses/sync_cses.py --cookie <您的_PHPSESSID>
```
*   **運作機制**：腳本會自動登入 CSES ➡️ 比對 CSES 已解題目與 GitHub 檔案 ➡️ 下載缺失代碼至 `cses/` 目錄下 ➡️ 自動 Commit 與 Push ➡️ 透過 `sparse-checkout` 自動將本地 C++ 檔案隱藏，保持工作區乾淨。
*   **Cookie 獲取方法**：登入 cses.fi ➡️ 按 F12 ➡️ 進入「應用程式 (Application)」或「儲存空間 (Storage)」 ➡️ 展開 Cookies 點擊 cses.fi ➡️ 複製 `PHPSESSID` 的值。

### 步驟 3：在 Notion 撰寫題解 (選填)
若想在公開網站上呈現該題的詳細解析，請至您的 Notion `CSES 題解` 資料庫中新增一筆項目：
*   **屬性設定**：
    *   `Name` (標題)：填寫題目名稱（例如 `Weird Algorithm`）。
    *   `Filename` (純文字)：填寫與 Repo 一致的 C++ 檔名（例如 `Weird.cpp`）。
    *   `Category` (單選/多選)：選擇題目分類（例如 `Introductory Problems`）。
    *   `Difficulty` (單選)：選擇難易度（`Easy` / `Medium` / `Hard`）。
    *   `CSESLink` (網址)：填寫原題連結。
*   **正文**：直接在頁面正文撰寫說明與思路，網站會透過 Notion API 自動拉取並轉為 Markdown 格式呈現在雙欄網頁中。

### 步驟 4：自動部署 (GitHub Actions)
您不需要手動編譯或推送網頁！
*   當您在 **步驟 2** 執行同步腳本並推送至 `main` 分支時，GitHub Actions 會自動偵測並觸發編譯工作流，在背景將最新的 Next.js 靜態網頁與 Notion 更新發佈到公開網站。
*   🪐 **公開網站網址**：[https://benjamin-shih-tw.github.io/Competitive-Programming/](https://benjamin-shih-tw.github.io/Competitive-Programming/)

---

## 💻 本地網站預覽與測試

若要在本地端測試與預覽網站，或直接在網頁端使用「一鍵同步功能」：

### 1. 配置 Notion 連線環境變數
在 `cses/website/` 目錄下建立 `.env.local` 檔案並填入您的 API 金鑰：
```env
NOTION_API_KEY=your_notion_integration_token_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

### 2. 啟動 Next.js 本地伺服器
```bash
cd cses/website
npm run dev
```
*   啟動後造訪：`http://localhost:3000/Competitive-Programming/`
*   在本地開發模式下，您可以直接在網頁上貼上 `PHPSESSID` 進行 Cookie 一鍵同步下載與推送。
