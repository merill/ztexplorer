import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import OverviewPage from '@/pages/OverviewPage';
import PillarPage from '@/pages/PillarPage';

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="pillar/:pillarId" element={<PillarPage />} />
      </Route>
    </Routes>
  );
}
