import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { toRanks } from '../rating';
import type { Thread } from '../types';

// S → E にかけて薄くなるオレンジ
const RANK_COLORS = ['#e65100', '#f57c00', '#fb8c00', '#ffa726', '#ffcc80', '#ffe0b2'];

export default function RankBoard({ thread }: { thread: Thread }) {
  const ranks = toRanks(thread.characters);
  if (ranks.length === 0) return null;
  return (
    <section>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        {ranks.map((r, i) => (
          <Box key={r.label} sx={{ display: 'flex', borderTop: i ? '1px solid' : 0, borderColor: 'divider' }}>
            <Box
              sx={{
                width: 44,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                bgcolor: RANK_COLORS[i],
                color: i < 3 ? '#fff' : '#7a3d00',
              }}
            >
              {r.label.charAt(0)}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75, p: 1, minHeight: 44, alignItems: 'center' }}>
              {r.characters.map((c) => (
                <Box
                  key={c.name}
                  sx={{ px: 1, py: 0.25, fontSize: 14, bgcolor: '#fff7ef', borderRadius: 1, overflowWrap: 'anywhere' }}
                >
                  {c.name}
                  <Box component="span" sx={{ ml: 0.75, fontSize: 11, color: 'text.secondary' }}>
                    {c.rating.toFixed(1)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      {thread.updatedAt && (
        <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary', textAlign: 'right' }}>
          {format(thread.updatedAt.toDate(), 'yyyy/MM/dd')} 更新
        </Typography>
      )}
    </section>
  );
}
