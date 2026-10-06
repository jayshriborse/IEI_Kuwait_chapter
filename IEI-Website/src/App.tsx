import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignInPage } from './pages/SignInPage';
import { PublicHome } from './pages/PublicHome';
import { AppLayout } from './components/AppLayout';
import { PlaceholderPage } from './pages/PlaceholderPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Institutional Landing Page */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/public" element={<PublicHome />} />
        <Route path="/home" element={<PublicHome />} />
        <Route path="/events" element={<PublicHome />} />
        <Route path="/about" element={<PublicHome />} />

        {/* Member Portal / Authentication */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/portal" element={<SignInPage />} />

        {/* Member App Shell with remaining tabs if needed */}
        <Route element={<AppLayout />}>
          <Route path="/jobs" element={<PlaceholderPage title="Jobs" />} />
          <Route path="/gallery" element={<PlaceholderPage title="Gallery" />} />
          <Route path="/card" element={<PlaceholderPage title="Card" />} />
          <Route path="/community" element={<PlaceholderPage title="Community" />} />
          <Route path="/me" element={<PlaceholderPage title="Me" />} />
        </Route>

        {/* Catch-all redirect to public home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
