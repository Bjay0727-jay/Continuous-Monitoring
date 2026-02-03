import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { FindingsPage } from './pages/FindingsPage';
import { FindingDetailPage } from './pages/FindingDetailPage';
import { IntegrationsPage } from './pages/IntegrationsPage';

export function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/findings" element={<FindingsPage />} />
          <Route path="/findings/:id" element={<FindingDetailPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="empty-state">
      <h2>404 — Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
