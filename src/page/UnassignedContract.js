import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button, Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
  },
  emoji: {
    fontSize: '4rem',
    marginBottom: theme.spacing(2),
  },
  heading: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const NotFoundPage = () => {
  const classes = useStyles();

  const handleClose = () => {
    window.close();
  };

  return (
    <div className={classes.root}>
      <Typography variant="h1" className={classes.emoji}>
        😮
      </Typography>
      <Typography variant="h4" className={classes.heading}>
        Oops! Acredito que você ainda não tenha assinado essa extensão!
      </Typography>

      <Box mt={4}>
        <Button variant="contained" color="primary" className={classes.button} onClick={handleClose}>
          fechar
        </Button>
      </Box>
    </div>
  );
};

export default NotFoundPage;
