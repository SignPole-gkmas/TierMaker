import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AddThreadPage from './pages/AddThreadPage';
import ThreadPage from './pages/ThreadPage';

export default function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="sm" component="main" sx={{ flex: 1, py: 3 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/addThread" element={<AddThreadPage />} />
          <Route path="/thread/:id" element={<ThreadPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
}
