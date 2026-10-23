import { Link } from 'react-router-dom';
import { Box, Button, Container } from '@mui/material';
import { SITE_NAME, routes } from '../routes';
import { useOnlineCount } from '../presence';

export default function Header() {
  const online = useOnlineCount();
  return (
    <Box component="header" sx={{ borderTop: 4, borderColor: 'primary.main', borderBottom: '1px solid', borderBottomColor: 'divider' }}>
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', height: 52, gap: 1.5 }}>
        <Box
          component={Link}
          to={routes.home}
          sx={{ flex: 1, minWidth: 0, fontWeight: 700, color: 'text.primary', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          {SITE_NAME}
        </Box>
        {online !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main' }} />
            {online}人がプレイ中
          </Box>
        )}
        <Button component={Link} to={routes.addThread} size="small">
          ＋ 作成
        </Button>
      </Container>
    </Box>
  );
}
