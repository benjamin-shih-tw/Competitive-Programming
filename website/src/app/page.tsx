import React from 'react';
import { getAllCppFiles } from '../lib/cppFiles';
import { getNotionSolutions } from '../lib/notion';
import Dashboard from './components/Dashboard';

export const revalidate = 60; // Revalidate pages at most every 60 seconds (ISR)

export default async function HomePage() {
  const isNotionConfigured = !!(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID);
  
  // Fetch C++ files from repository
  const cppFiles = await getAllCppFiles();
  
  // Fetch Notion solutions from DB
  const notionSolutions = await getNotionSolutions();

  return (
    <main className="container" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Dashboard 
        cppFiles={cppFiles}
        notionSolutions={notionSolutions}
        isNotionConfigured={isNotionConfigured}
      />
    </main>
  );
}
