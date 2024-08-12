import React from 'react';

const VideoPlayer = ({ videoRef }) => (
  <video
    ref={videoRef}
    style={{ width: '100%', height: '100%' }}
    autoPlay
    playsInline
    muted
    controls
  />
);

export default VideoPlayer;
