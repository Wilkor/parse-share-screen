import React from 'react';
import { Button, Typography } from '@material-ui/core';

const SharingStatus = ({ hash, copyToClipboard, stopSharing }) => {
    return (
        <>
            <Typography variant="body1" style={{ marginTop: '20px' }}>
                Código para conectar: {hash}
            </Typography>
            <Button
                variant="outlined"
                color="primary"
                onClick={copyToClipboard}
                style={{ marginTop: '10px' }}
            >
                Copiar código
            </Button>
            <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={stopSharing}
                style={{ marginTop: '20px' }}
            >
                Parar e Salvar
            </Button>
        </>
    );
};

export default SharingStatus;
