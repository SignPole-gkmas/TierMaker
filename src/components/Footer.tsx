import { Box } from '@mui/material';
import { SITE_NAME } from '../routes';

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, textAlign: 'center', fontSize: 12, color: 'text.secondary' }}>
      © {new Date().getFullYear()} {SITE_NAME}
    </Box>
  );
}
