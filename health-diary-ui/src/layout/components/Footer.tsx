import { Box, Typography } from '@mui/material';
import packageJson from '../../../package.json';
import type React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        py: 1,
        px: 2,
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
        sx={{ wordBreak: 'break-word' }}
      >
        Health Diary v{packageJson.version}
      </Typography>
      <Typography 
        variant="caption" 
        color="text.secondary" 
        align="center"
        display="block"
        sx={{ wordBreak: 'break-word' }}
      >
        © {currentYear} Health Diary. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;