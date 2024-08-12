import React from 'react';
import { Button, Box } from '@material-ui/core';

const ClientUrlButton = ({ clientUrl, sendMessageBlip }) => (
  clientUrl && (
    <Box mt={3}>
      <Button
        variant="contained"
        onClick={sendMessageBlip}
        fullWidth
        style={{
          marginTop: '10px',
          backgroundColor: 'green',
          color: 'white',
        }}
      >
        Enviar ao cliente
      </Button>
    </Box>
  )
);

export default ClientUrlButton;
