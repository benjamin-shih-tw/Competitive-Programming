import React from 'react';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { getCppFileByFilename, getAllCppFiles } from '../../../lib/cppFiles';
import { getNotionSolutionDetails } from '../../../lib/notion';
import ProblemView from '../../components/ProblemView';

type PageParams = Promise<{ filename: string }>;

interface ProblemPageProps {
  params: PageParams;
}

// Generate static routes for all solution files at build time
export async function generateStaticParams() {
  try {
    const cppFiles = await getAllCppFiles();
    return cppFiles.map((file) => ({
      filename: file.filename,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Simple preprocessor to transform GitHub alert blocks into readable headers
function preprocessMarkdown(md: string): string {
  if (!md) return '';
  return md
    .replace(/^>\s*\[!NOTE\]\s*$/gim, '> **💡 提示 (Note)**')
    .replace(/^>\s*\[!TIP\]\s*$/gim, '> **✨ 技巧 (Tip)**')
    .replace(/^>\s*\[!IMPORTANT\]\s*$/gim, '> **📢 重要 (Important)**')
    .replace(/^>\s*\[!WARNING\]\s*$/gim, '> **⚠️ 警告 (Warning)**')
    .replace(/^>\s*\[!CAUTION\]\s*$/gim, '> **🚨 注意 (Caution)**');
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { filename } = await params;
  
  // URL-decoded filename (handles spaces like 'Concert%20Tickets.cpp' -> 'Concert Tickets.cpp')
  const decodedFilename = decodeURIComponent(filename);
  
  // Fetch C++ file content
  const cppFile = await getCppFileByFilename(decodedFilename);
  if (!cppFile) {
    notFound();
  }

  // Fetch Notion solution details
  const notionDetail = await getNotionSolutionDetails(
    cppFile.filename,
    cppFile.displayName,
    cppFile.category,
    cppFile.problemUrl
  );

  // Configure marked for GFM and safe line-breaks
  const rawHtml = await marked.parse(preprocessMarkdown(notionDetail.explanationMarkdown));

  return (
    <main className="container" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <ProblemView
        displayName={notionDetail.title}
        filename={cppFile.filename}
        category={notionDetail.category}
        code={cppFile.code}
        csesLink={notionDetail.csesLink}
        difficulty={notionDetail.difficulty}
        explanationHtml={rawHtml}
        isMock={notionDetail.isMock || false}
      />
    </main>
  );
}
