import React from 'react';
import { TextField, Button, Typography } from '@material-ui/core';

const HashInput = ({ hash, setHash, connected, startSharing }) => (
  <>
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id="hash"
      label="Insira o código"
      name="hash"
      autoComplete="hash"
      autoFocus
      value={hash}
      onChange={(e) => setHash(e.target.value)}
    />
    <Button
      variant="contained"
      color="primary"
      onClick={startSharing}
      fullWidth
      style={{ marginTop: '10px' }}
    >
      Conectar
    </Button>


    {connected && (
      <Typography variant="body1" style={{ marginTop: '20px' }}>
        Conectado ao compartilhamento de tela.
      </Typography>
    )}
  </>
);

export default HashInput;
