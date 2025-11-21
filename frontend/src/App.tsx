import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import MovementsPage from "./pages/MovementsPage";
import ReportsPage from "./pages/ReportsPage";

/** Container principal da aplicação com as rotas das páginas.
 * @returns Layout com navegação.
 */
export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route element={<Navigate replace to="/dashboard" />} path="/" />
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<MovementsPage />} path="/movimentacoes" />
        <Route element={<ReportsPage />} path="/relatorios" />
      </Routes>
    </AppLayout>
  );
}
