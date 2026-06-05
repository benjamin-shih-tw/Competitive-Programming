# 🚀 CSES 題解入口網站與 GitHub/Notion 自動同步專案

本專案建立了一個精美的 CSES 題解入口網站，能動態讀取您在 Notion 撰寫的題解，並自動比對您在 CSES 官方網站上的解題狀態。透過一鍵同步機制，專案會自動下載已通過（AC）但 GitHub 缺失的 C++ 代碼並依序推送至 GitHub，同時透過 Git 稀疏檢出（Sparse-checkout）維持本機工作區的絕對乾淨。

* 🪐 **公開網站網址**：[https://benjamin-shih-tw.github.io/Competitive-Programming/](https://benjamin-shih-tw.github.io/Competitive-Programming/)
* 💻 **本地工作區**：僅顯示 `Untitled-3.cpp` 與同步工具，其餘 C++ 檔案在本地端皆會自動清理與隱藏。

---

## 🛠️ 日常解題與發佈 SOP (標準作業流程)

未來您在 CSES 寫過新題目後，請遵循以下步驟同步代碼與更新網頁：

### 步驟 1：在 CSES 上解題
* 您可以直接在本機工作區的 `Untitled-3.cpp` 寫 code，或直接在 CSES 網頁上解題並取得 **AC (Accepted)**。

### 步驟 2：同步 AC 代碼至 GitHub (本機端)
打開您的終端機，在專案根目錄下執行 Python 同步腳本：
```bash
python3 sync_cses.py --cookie <您的_PHPSESSID>
```
* **運作機制**：腳本會自動登入 CSES ➡️ 比對 CSES 已解題目與 GitHub 檔案 ➡️ 下載缺失代碼 ➡️ 轉為 PascalCase 檔名 ➡️ 自動 Commit 與 Push ➡️ 透過 `sparse-checkout` 自動將本地 C++ 檔案清理隱藏。
* **Cookie 獲取方法**：登入 cses.fi ➡️ 按 F12 ➡️ 進入「應用程式 (Application)」或「儲存空間 (Storage)」 ➡️ 展開 Cookies 點擊 cses.fi ➡️ 複製 `PHPSESSID` 的值。

### 步驟 3：在 Notion 撰寫題解 (選填)
若想在公開網站上呈現該題的詳細解析，請至您的 Notion `CSES 題解` 資料庫中新增一筆項目：
* **屬性設定**：
  * `Name` (標題)：填寫題目名稱（例如 `Weird Algorithm`）。
  * `Filename` (純文字)：填寫與 Repo 一致的 C++ 檔名（例如 `Weird.cpp`）。
  * `Category` (單選/多選)：選擇題目分類（例如 `Introductory Problems`）。
  * `Difficulty` (單選)：選擇難易度（`Easy` / `Medium` / `Hard`）。
  * `CSESLink` (網址)：填寫原題連結。
* **正文**：直接在頁面正文撰寫說明與思路，網站會透過 Notion API 自動拉取並轉為 Markdown 格式呈現在雙欄網頁中。

### 步驟 4：一鍵重新發佈網站 (GitHub Pages)
若要將最新同步的代碼與 Notion 題解發佈到公開網站上，請在專案根目錄執行以下一鍵部署指令：
```bash
cd website && npm run build && cd out && git init && git checkout -b gh-pages && git add . && git commit -m "Update site" && git remote add origin https://github.com/benjamin-shih-tw/Competitive-Programming.git && git push -f origin gh-pages && rm -rf .git
```
* **注意**：由於 GitHub Pages 為靜態託管，線上公開網站僅作閱讀與展示（「網頁端一鍵同步」功能會提示僅限本地使用），您必須執行此指令來更新線上的 HTML 靜態檔案。

---

## 💻 本地開發與預覽

若要在本地端測試與預覽網頁，或直接在網頁端使用「一鍵同步功能」：

### 1. 配置 Notion 連線環境變數
在 `website/` 目錄下建立 `.env.local` 檔案並填入您的 API 金鑰：
```env
NOTION_API_KEY=your_notion_integration_token_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

### 2. 啟動 Next.js 本地伺服器
```bash
cd website
npm run dev
```
* 啟動後造訪：`http://localhost:3000/Competitive-Programming/`
* 在本地開發模式下，您可以直接在網頁上貼上 `PHPSESSID` 進行 Cookie 一鍵同步下載與推送。
