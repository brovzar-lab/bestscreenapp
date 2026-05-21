import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import EditorScreen from './screens/EditorScreen';
import Layout from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

function AppContent(): JSX.Element {
  const { user, loading, signInWithGoogle, signOut, continueAsDemo } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center">
        <div className="text-brand-500 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onSignInWithGoogle={signInWithGoogle}
        onContinueAsDemo={continueAsDemo}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              title="CutTo"
              isDemo={user.isDemo}
              onSignOut={signOut}
            >
              <DashboardScreen user={user} />
            </Layout>
          }
        />
        <Route
          path="/editor/:scriptId"
          element={
            <Layout
              title="CutTo — Editor"
              isDemo={user.isDemo}
              onSignOut={signOut}
            >
              <EditorScreen />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#292524', color: '#f5f5f4', border: '1px solid #44403c' },
        }}
      />
    </QueryClientProvider>
  );
}
