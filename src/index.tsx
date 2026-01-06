import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import { AppRoutes } from './routes/AppRoutes';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
