import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import { AppRoutes } from './routes/AppRoutes';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);
