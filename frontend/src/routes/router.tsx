import { createBrowserRouter } from 'react-router-dom';
import { AgentsRoute } from '../modules/agents/pages/AgentsPage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { BriefPage } from '../modules/brief/pages/BriefPage';
import { CatalogPage } from '../modules/catalog/pages/CatalogPage';
import { ChatRoute } from '../modules/chat/pages/ChatPage';
import { CompaniesPage } from '../modules/companies/pages/CompaniesPage';
import { CompanyPage } from '../modules/companies/pages/CompanyPage';
import { HomeRedirect, RequireRole } from './RequireRole';
import { RootLayout } from './RootLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: 'entrada', element: <LoginPage />, handle: { page: 'login' } },
      {
        path: 'assistentes',
        element: (
          <RequireRole role="user">
            <CatalogPage />
          </RequireRole>
        ),
        handle: { page: 'catalog' },
      },
      {
        path: 'assistentes/:agentId',
        element: (
          <RequireRole role="user">
            <ChatRoute />
          </RequireRole>
        ),
        handle: { page: 'chat' },
      },
      {
        path: 'administracao',
        element: (
          <RequireRole role="admin">
            <CompaniesPage />
          </RequireRole>
        ),
        handle: { page: 'admin' },
      },
      {
        path: 'administracao/empresas/:companyId',
        element: (
          <RequireRole role="admin">
            <CompanyPage />
          </RequireRole>
        ),
        handle: { page: 'company' },
      },
      {
        path: 'administracao/agentes',
        element: (
          <RequireRole role="admin">
            <AgentsRoute />
          </RequireRole>
        ),
        handle: { page: 'agents' },
      },
      { path: 'sobre', element: <BriefPage />, handle: { page: 'brief' } },
      { path: '*', element: <HomeRedirect /> },
    ],
  },
]);
