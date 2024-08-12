import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Typography, Container, Paper, Box, Avatar } from '@material-ui/core';
import logo from '../../src/images/sharedscreen.png';
import { useLocation } from 'react-router-dom';
import SharingControls from '../components/Client/SharingControls';
import SharingStatus from '../components/Client/SharingStatus';

const socket = io('https://pontoparse.herokuapp.com/');

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Client() {
    const query = useQuery();
    const [hash, setHash] = useState(localStorage.getItem('hash') || '');
    const [sharingStarted, setSharingStarted] = useState(localStorage.getItem('sharingStarted') === 'true');
    const [permissionRequested, setPermissionRequested] = useState(false);
    const [sharingOption, setSharingOption] = useState('screen');
    const [audioDevices, setAudioDevices] = useState([]);
    const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
    const [clientUrl, setClientUrl] = useState('');
    const peerRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter(device => device.kind === 'audioinput');
                setAudioDevices(audioInputs);
            } catch (err) {
                console.error('Error listing devices:', err);
            }
        };

        fetchDevices();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = new URL(`http://localhost:3000/client?${params}`);
        setClientUrl(url.toString());
    }, []);

    useEffect(() => {
        const handleDisconnect = async (disconnectedHash) => {
            if (disconnectedHash === hash) {
                alert('A outra parte desconectou. Voltando à tela inicial.');
                await stopSharing();
                setTimeout(() => {
                    window.location.reload();
                }, 2000)
            }
        };

        socket.on('disconnectNotify', handleDisconnect);

        return () => {
            socket.off('disconnectNotify', handleDisconnect);
        };
    }, [hash]);

    const startSharing = async () => {
        if (sharingStarted) return;

        if (!permissionRequested) {
            setPermissionRequested(true);
        }

        try {
            let videoStream, audioStream;

            try {
                if (sharingOption === 'screen') {
                    videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                } else if (sharingOption === 'screenAudio') {
                    videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    videoStream.addTrack(audioStream.getAudioTracks()[0]);
                } else if (sharingOption === 'videoAudio') {
                    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    audioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedAudioDevice } });
                    videoStream.addTrack(audioStream.getAudioTracks()[0]);
                } else if (sharingOption === 'audio') {
                    audioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedAudioDevice } });
                }
            } catch (err) {
                console.error('Error accessing media devices:', err);
                throw new Error('Não foi possível acessar os dispositivos de mídia.');
            }

            const combinedStream = new MediaStream();
            if (videoStream) videoStream.getTracks().forEach(track => combinedStream.addTrack(track));
            if (audioStream) audioStream.getTracks().forEach(track => combinedStream.addTrack(track));

            streamRef.current = combinedStream;

            try {
                const options = { mimeType: 'video/webm; codecs=vp8' };
                const recorder = new MediaRecorder(combinedStream);
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                recorder.onstop = async () => {
                    try {
                        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                        if (blob.size === 0) return;

                        const formData = new FormData();
                        formData.append('file', blob, 'video.webm');
                        formData.append('url', clientUrl);

                        const response = await fetch('https://pontoparse.herokuapp.com/api/v3/api-view-desk/upload', {
                            method: 'POST',
                            body: formData
                        });

                        if (response.ok) {
                            console.log('Upload realizado com sucesso!');

                            window.location.reload();
                        

                        } else {
                            console.error('Erro ao fazer upload:', response.statusText);
                        }

                    } catch (err) {
                        console.error('Erro ao enviar o arquivo:', err);
                    } finally {
                        recordedChunksRef.current = [];
                    }
                };

                recorder.start();
            } catch (err) {
                console.error('Error starting media recorder:', err);
                throw new Error('Não foi possível iniciar o gravador de mídia.');
            }

            try {
                const peer = new SimplePeer({ initiator: true, trickle: false, stream: combinedStream });
                peerRef.current = peer;

                const uniqueHash = Date.now().toString();
                setHash(uniqueHash);

                peer.on('signal', (data) => {
                    socket.emit('startShare', { hash: uniqueHash, signalData: data, client: 'cliente' });
                });

                socket.on('viewScreen', ({ signalData }) => {
                    if (peerRef.current) {
                        peerRef.current.signal(signalData);
                    }
                });

                if (streamRef.current) {
                    streamRef.current.addEventListener('inactive', handleStreamInactive);
                }

                setSharingStarted(true);
                localStorage.setItem('sharingStarted', 'true');
            } catch (err) {
                console.error('Error setting up peer connection:', err);
                throw new Error('Não foi possível configurar a conexão peer.');
            }
        } catch (err) {
            console.error('Error starting sharing process:', err);
            alert('Erro ao iniciar o compartilhamento. Por favor, tente novamente.');
        }
    };

    const handleStreamInactive = async () => {
        await stopSharing();

    };

    const stopSharing = async () => {


        if (!sharingStarted) return;

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (peerRef.current) {
            peerRef.current.destroy();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        setSharingStarted(false);
        // Notificar o servidor sobre o término do compartilhamento
        socket.emit('stopShare', { hash, client: 'client' });
        localStorage.removeItem('sharingStarted');
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(hash);
            alert('Código copiado para a área de transferência!');
        } catch (err) {
            console.error('Erro ao copiar para a área de transferência:', err);
            alert('Erro ao copiar o código. Por favor, tente novamente.');
        }
    };

    return (
        <Container maxWidth="sm">

            <Paper style={{ padding: '20px', marginTop: '20px' }}>

                <Box display="flex" justifyContent="center" alignItems="center" marginTop="20px">
                    <Avatar alt="logo" src={logo} style={{ width: '100px', height: '100px' }} />
                </Box>
                <Typography variant="h4" align="center" gutterBottom>
                    Compartilhamento de Tela
                </Typography>
                {!sharingStarted ? (
                    <SharingControls
                        sharingOption={sharingOption}
                        setSharingOption={setSharingOption}
                        audioDevices={audioDevices}
                        selectedAudioDevice={selectedAudioDevice}
                        setSelectedAudioDevice={setSelectedAudioDevice}
                        startSharing={startSharing}
                    />
                ) : (
                    <SharingStatus
                        hash={hash}
                        copyToClipboard={copyToClipboard}
                        stopSharing={stopSharing}
                    />
                )}
            </Paper>
        </Container>
    );
}

export default Client;
