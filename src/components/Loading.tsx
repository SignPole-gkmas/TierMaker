import { Box, CircularProgress, Typography } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ textAlign: 'center', my: 4 }}>
      <CircularProgress size={24} />
    </Box>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <Typography sx={{ my: 1, fontSize: 14, color: 'error.main', whiteSpace: 'pre-line' }}>{message}</Typography>
  );
}

/** ページ内の小見出し */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ mt: 4, mb: 1, fontSize: 13, fontWeight: 700, color: 'text.secondary' }}>{children}</Typography>
  );
}
