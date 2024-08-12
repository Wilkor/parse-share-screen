import React from 'react';
import { Box, Avatar } from '@material-ui/core';
import logo from '../../../src/images/sharedscreen.png'

const AvatarLogo = () => (
  <Box mt={3} mb={2} style={{ display: 'flex', justifyContent: 'center' }}>
    <Avatar alt="Logo" src={logo} style={{ width: '150px', height: '150px', borderRadius: '25%' }} />
  </Box>
);

export default AvatarLogo;
