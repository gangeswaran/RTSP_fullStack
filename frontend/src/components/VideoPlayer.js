import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js'; 
import '../styles/VideoPlayer.css';

const VideoPlayer = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1); // Default volume (1 = 100%)

    useEffect(() => {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource('http://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'); 
            hls.attachMedia(videoRef.current);
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = 'http://localhost:8080/output.m3u8';
        }
    }, []);

    const handlePlayPause = () => {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch((error) => {
                console.error('Error trying to play:', error);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (event) => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        videoRef.current.volume = newVolume; // Set the video volume
    };

    return (
        <div className="video-player-container">
            <video ref={videoRef} className="video" controls>
                Your browser does not support the video tag.
            </video>
            <div className="controls">
                <button onClick={handlePlayPause} className={`play-pause-button ${isPlaying ? 'active' : ''}`}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
            </div>
        </div>
    );
};

export default VideoPlayer;
