import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { SITE_NAME } from '../routes';

type Props = { title: string; description: string; url: string };

export default function ThreadHeader({ title, description, url }: Props) {
  const [copied, setCopied] = useState(false);
  const xUrl = `https://x.com/intent/post?${new URLSearchParams({ text: title, url, hashtags: SITE_NAME })}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box component="header" sx={{ mb: 3 }}>
      <Typography component="h1" sx={{ fontSize: 22, fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary', whiteSpace: 'pre-line' }}>{description}</Typography>
      )}
      <Box sx={{ mt: 1, ml: -1 }}>
        <Button size="small" sx={{ color: 'text.secondary' }} href={xUrl} target="_blank" rel="noopener noreferrer">
          Xで共有
        </Button>
        <Button size="small" sx={{ color: 'text.secondary' }} onClick={copy}>
          {copied ? 'コピーしました' : 'URLをコピー'}
        </Button>
      </Box>
    </Box>
  );
}
