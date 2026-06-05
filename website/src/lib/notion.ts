import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

// Initialize Notion Client if variables are present
const apiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

const notion = apiKey ? new Client({ auth: apiKey, notionVersion: '2022-06-28' }) : null;
const n2m = notion ? new NotionToMarkdown({ notionClient: notion }) : null;

export interface NotionSolution {
  filename: string; // The .cpp filename (foreign key)
  title: string;
  category: string;
  csesLink?: string;
  difficulty?: string;
  explanationMarkdown: string;
  isMock?: boolean;
}

// Empty mock solutions map as requested.
const MOCK_SOLUTIONS: Record<string, Omit<NotionSolution, 'filename'>> = {};

// Returns a simple mock explanation for problems not explicitly defined in MOCK_SOLUTIONS
function getFallbackMockSolution(filename: string = '', displayName: string = '', category: string = '', csesLink?: string): NotionSolution {
  const isMedium = filename ? (filename.includes('Query') || filename.includes('Trip') || filename.includes('Tree')) : false;
  return {
    filename,
    title: displayName,
    category,
    csesLink,
    difficulty: isMedium ? 'Medium' : 'Easy',
    explanationMarkdown: `
### 題目解析 (CSES - ${displayName})

此題解目前尚未在 Notion 中撰寫。您可以隨時登入您的 Notion，並在對應的題解頁面中輸入內容。

本網站會透過 Notion API 自動取得更新，您只需在 Notion 寫完後重新整理本網頁即可！

### 當前狀態
- **程式碼**: 系統已成功在 GitHub 專案中偵測到本題的 C++ 原始碼 \`${filename}\`，您可在右側（或下方）的分頁中直接查看代碼。
- **題解**: 待 Notion 編輯。
- **原始題目連結**: ${csesLink ? `[前往 CSES 官方查看原題](${csesLink})` : '請前往 CSES 官方網站查詢。'}

> [!NOTE]
> **Notion 同步原理**：
> 當您在 Notion 資料庫中建立一筆項目，並將其 \`Filename\` 欄位設定為 \`${filename}\` 後，此處的內容將會自動被您在 Notion 中所撰寫的精美題解所替代。
    `,
    isMock: true,
  };
}

// Fetch all database entries from Notion
export async function getNotionSolutions(): Promise<NotionSolution[]> {
  if (!notion || !databaseId) {
    return [];
  }

  try {
    const response = await notion.request<any>({
      path: `databases/${databaseId}/query`,
      method: 'post',
      body: {},
    });

    const solutions: NotionSolution[] = [];

    for (const page of response.results) {
      if ('properties' in page) {
        const props = page.properties;
        
        // Extract Title (Name property)
        let title = '';
        if (props.Name && props.Name.type === 'title' && props.Name.title.length > 0) {
          title = props.Name.title.map((t: any) => t.plain_text).join('');
        }

        // Extract Filename (Rich Text property)
        let filename = '';
        if (props.Filename && props.Filename.type === 'rich_text' && props.Filename.rich_text.length > 0) {
          filename = props.Filename.rich_text.map((t: any) => t.plain_text).join('').trim();
        }

        // Extract Category (Select or Multi-select)
        let category = 'General';
        if (props.Category && props.Category.type === 'select' && props.Category.select) {
          category = props.Category.select.name;
        } else if (props.Category && props.Category.type === 'multi_select' && props.Category.multi_select.length > 0) {
          category = props.Category.multi_select[0].name;
        }

        // Extract Difficulty (Select)
        let difficulty = 'Medium';
        if (props.Difficulty && props.Difficulty.type === 'select' && props.Difficulty.select) {
          difficulty = props.Difficulty.select.name;
        }

        // Extract CSESLink (URL)
        let csesLink = '';
        if (props.CSESLink && props.CSESLink.type === 'url' && props.CSESLink.url) {
          csesLink = props.CSESLink.url;
        }

        if (filename) {
          solutions.push({
            filename,
            title: title || filename.replace('.cpp', ''),
            category,
            csesLink: csesLink || undefined,
            difficulty,
            explanationMarkdown: '', 
          });
        }
      }
    }

    return solutions;
  } catch (error) {
    console.error('Error fetching Notion database entries:', error);
    return [];
  }
}

// Fetch single problem explanation from Notion
export async function getNotionSolutionDetails(filename: string, displayName: string, category: string, problemUrl?: string): Promise<NotionSolution> {
  const mockData = getFallbackMockSolution(filename, displayName, category, problemUrl);

  if (!notion || !databaseId) {
    return {
      filename,
      title: mockData.title,
      category: mockData.category,
      csesLink: mockData.csesLink || problemUrl,
      difficulty: mockData.difficulty,
      explanationMarkdown: mockData.explanationMarkdown,
      isMock: true,
    };
  }

  try {
    // 1. Query the database for the page matching the filename
    const response = await notion.request<any>({
      path: `databases/${databaseId}/query`,
      method: 'post',
      body: {
        filter: {
          property: 'Filename',
          rich_text: {
            equals: filename,
          },
        },
      },
    });

    if (response.results.length === 0) {
      return {
        filename,
        title: mockData.title,
        category: mockData.category,
        csesLink: mockData.csesLink || problemUrl,
        difficulty: mockData.difficulty,
        explanationMarkdown: mockData.explanationMarkdown,
        isMock: true,
      };
    }

    const page = response.results[0];
    const pageId = page.id;
    let title = displayName;
    let dbCategory = category;
    let difficulty = 'Medium';
    let csesLink = problemUrl;

    if ('properties' in page) {
      const props = page.properties;
      if (props.Name && props.Name.type === 'title' && props.Name.title.length > 0) {
        title = props.Name.title.map((t: any) => t.plain_text).join('');
      }
      if (props.Category && props.Category.type === 'select' && props.Category.select) {
        dbCategory = props.Category.select.name;
      } else if (props.Category && props.Category.type === 'multi_select' && props.Category.multi_select.length > 0) {
        dbCategory = props.Category.multi_select[0].name;
      }
      if (props.Difficulty && props.Difficulty.type === 'select' && props.Difficulty.select) {
        difficulty = props.Difficulty.select.name;
      }
      if (props.CSESLink && props.CSESLink.type === 'url' && props.CSESLink.url) {
        csesLink = props.CSESLink.url;
      }
    }

    // 2. Fetch page blocks and convert to Markdown
    if (n2m) {
      const mdBlocks = await n2m.pageToMarkdown(pageId);
      const markdownString = n2m.toMarkdownString(mdBlocks);
      
      return {
        filename,
        title,
        category: dbCategory,
        difficulty,
        csesLink: csesLink || undefined,
        explanationMarkdown: markdownString.parent || 'No content found in this Notion page.',
        isMock: false,
      };
    }

    throw new Error('Notion to Markdown converter not initialized');
  } catch (error) {
    console.error(`Error fetching solution details for ${filename} from Notion:`, error);
    return {
      filename,
      title: mockData.title,
      category: mockData.category,
      csesLink: mockData.csesLink || problemUrl,
      difficulty: mockData.difficulty,
      explanationMarkdown: `
> [!WARNING]
> **連線失敗**: 無法從 Notion API 取得本題解的動態內容。已為您載入預設的提示。
>
> 錯誤原因可能是：您的 Notion API Key 或 Database ID 配置不正確，或者網路連線中斷。

${mockData.explanationMarkdown}
      `,
      isMock: true,
    };
  }
}
