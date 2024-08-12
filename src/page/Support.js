import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Container, Paper, Grid } from '@material-ui/core';
import AvatarLogo from '../components/Support/AvatarLogo';
import HashInput from '../components/Support/HashInput';
import ClientUrlButton from '../components/Support/ClientUrlButton';
import VideoPlayer from '../components/Support/VideoPlayer';
import UnassignedContract from '../page/UnassignedContract';

// Conexão com o servidor

const socket = io('https://pontoparse.herokuapp.com/');
//const socket = io('http://localhost:3333/');

function Support() {
  const videoRef = useRef();
  const [hash, setHash] = useState('');
  const [connected, setConnected] = useState(false);
  const [peer, setPeer] = useState(null);
  const [clientUrl, setClientUrl] = useState('');
  const [contract, setContract] = useState(true);

  useEffect(() => {
    // Função para lidar com desconexões
    const handleDisconnect = (disconnectedHash) => {
      if (disconnectedHash === hash) {
        alert('A outra parte desconectou. Voltando à tela inicial.');
        stopSharing();
      }
    };

    // Função para lidar com a parada de compartilhamento
    const handleStopShare = ({ hash }) => {
      console.log(`Recebido shareStopped para hash: ${hash}`);
      stopSharing(); // Chama a função de parar compartilhamento
    };

    // Adiciona listeners para eventos do socket
    socket.on('disconnectNotify', handleDisconnect);
    socket.on('shareStopped', handleStopShare);

    // Limpeza ao desmontar o componente
    return () => {
      socket.off('disconnectNotify', handleDisconnect);
      socket.off('shareStopped', handleStopShare);
      if (peer) {
        peer.destroy(); // Limpa o peer ao desmontar o componente
      }
    };
  }, [hash, peer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = new URL('http://localhost:3000/client');

    for (const [key, value] of params.entries()) {
      url.searchParams.append(key, value);
    }

    const clientUrl = url.toString();
    setClientUrl(clientUrl);

    const sendData = async () => {
      try {
        const response = await fetch('https://pontoparse.herokuapp.com/api/v3/api-view-desk/assinatura', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: clientUrl })
        });

        if (response.ok) {
          console.log('Dados enviados com sucesso!');
        } else {
          setContract(false);
          console.error('Erro ao enviar dados:', response.statusText);
        }
      } catch (error) {
        console.error('Erro de rede ou outro:', error);
      }
    };

    sendData();

  }, []);

  const startSharing = async () => {
    if (!hash) {
      alert('Por favor, insira um hash válido.');
      return;
    }
    socket.emit('joinShare', hash);
    try {
      const newPeer = new SimplePeer({ initiator: false, trickle: false });

      newPeer.on('signal', (data) => {
        console.log("signal", data);
        socket.emit('startShare', { hash, signalData: data, client: 'support' });
      });

      newPeer.on('stream', (stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((error) => {
              console.error('Erro ao tentar reproduzir o vídeo:', error);
            });
          };
        }
        setConnected(true);
        localStorage.setItem('isSharing', 'true');
      });

      socket.on('viewScreen', ({ signalData }) => {
        newPeer.signal(signalData);
      });

      setPeer(newPeer);

    } catch (error) {
      console.error('Erro ao tentar conectar:', error);
      window.location.reload(); // Recarregar a página em caso de erro
    }
  };

  const stopSharing = () => {
    if (peer) {
      peer.destroy(); // Para o peer e limpa os recursos
      setPeer(null);
    }
    setConnected(false);
    localStorage.removeItem('hash');
    localStorage.removeItem('isSharing');

    // Parar o stream de vídeo
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    videoRef.current.srcObject = null;

     window.close()
  };

  const sendMessageBlip = async () => {

    try {
      const response = await fetch('https://pontoparse.herokuapp.com/api/v3/api-view-desk/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: clientUrl }),
      });

      if (response.ok) {
        console.log('URL enviada com sucesso!');
      } else {
        console.error('Erro ao enviar a URL:', response.statusText);
      }
    } catch (error) {
      console.error('Erro de rede ou outro:', error);
    }

  };

  // Captura global de erros
  useEffect(() => {
    const handleError = (event) => {
      console.error('Erro não tratado:', event.message);
      window.location.reload(); // Recarregar a página em caso de erro
    };

    const handleUnhandledRejection = (event) => {
      console.error('Rejeição de promessa não tratada:', event.reason);
      window.location.reload(); // Recarregar a página em caso de erro
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <>
      {contract ? (
        <Container
          component="main"
          maxWidth="lg"
          style={{
            height: '90vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'nowrap',
          }}
        >
          <Grid container spacing={2} alignItems="stretch" style={{ flexWrap: 'nowrap', width: '100%' }}>
            {/* Primeiro Paper com o logo e os botões */}
            <Grid item style={{ width: '50%' }}>
              <Paper elevation={3} style={{ padding: '20px', textAlign: 'center', height: '100%' }}>
                <Grid container spacing={2} direction="column" alignItems="center">
                  <Grid item>
                    <AvatarLogo />
                  </Grid>
                  <Grid item>
                    <HashInput hash={hash} setHash={setHash} connected={connected} startSharing={startSharing} />
                  </Grid>
                  <Grid item>
                    <ClientUrlButton clientUrl={clientUrl} sendMessageBlip={sendMessageBlip} />
                  </Grid>
                  
                </Grid>
              </Paper>
            </Grid>

            {/* Segundo Paper com o player de vídeo */}
            <Grid item style={{ width: '50%' }}>
              <Paper elevation={3} style={{ padding: '20px', textAlign: 'center', height: '100%' }}>
                <VideoPlayer videoRef={videoRef} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      ) : (
        <UnassignedContract />
      )}


    </>
  );
}

export default Support;
