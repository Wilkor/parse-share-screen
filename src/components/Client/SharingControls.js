import React from 'react';
import { Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

const SharingControls = ({ sharingOption, setSharingOption, audioDevices, selectedAudioDevice, setSelectedAudioDevice, startSharing }) => {
    return (
        <>
            <FormControl variant="outlined" fullWidth style={{ marginTop: '20px' }}>
                <InputLabel>O que deseja compartilhar?</InputLabel>
                <Select
                    value={sharingOption}
                    onChange={(e) => setSharingOption(e.target.value)}
                    label="O que deseja compartilhar?"
                >
                    <MenuItem value="screen">Tela</MenuItem>
                    <MenuItem value="screenAudio">Tela e Áudio</MenuItem>
                    <MenuItem value="videoAudio">Vídeo e Áudio</MenuItem>
                    <MenuItem value="audio">Áudio</MenuItem>
                </Select>
            </FormControl>
            {(sharingOption === 'audio' || sharingOption === 'videoAudio') && (
                <FormControl variant="outlined" fullWidth style={{ marginTop: '20px' }}>
                    <InputLabel>Selecione o Dispositivo de Áudio</InputLabel>
                    <Select
                        value={selectedAudioDevice}
                        onChange={(e) => setSelectedAudioDevice(e.target.value)}
                        label="Selecione o Dispositivo de Áudio"
                    >
                        {audioDevices.map(device => (
                            <MenuItem key={device.deviceId} value={device.deviceId}>
                                {device.label || `Dispositivo de áudio ${device.deviceId}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={startSharing}
                style={{ marginTop: '20px' }}
            >
                Compartilhar
            </Button>
        </>
    );
};

export default SharingControls;
