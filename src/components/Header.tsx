import { Link } from 'react-router-dom';
import { Box, Button, Container } from '@mui/material';
import { SITE_NAME, routes } from '../routes';

export default function Header() {
  return (
    <Box component="header" sx={{ borderTop: 4, borderColor: 'primary.main', borderBottom: '1px solid', borderBottomColor: 'divider' }}>
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', height: 52 }}>
        <Box
          component={Link}
          to={routes.home}
          sx={{ flex: 1, fontWeight: 700, color: 'text.primary', textDecoration: 'none' }}
        >
          {SITE_NAME}
        </Box>
        <Button component={Link} to={routes.addThread} size="small">
          ＋ 作成
        </Button>
      </Container>
    </Box>
  );
}
