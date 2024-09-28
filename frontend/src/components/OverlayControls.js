import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import '../styles/OverlayControls.css';
import VideoPlayer from './VideoPlayer';

const OverlayControls = () => {
    const [overlays, setOverlays] = useState([]);
    const [overlay, setOverlay] = useState({
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        content: '',
        type: 'text',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedOverlayId, setSelectedOverlayId] = useState(null);
    const videoPlayerRef = useRef(null);
    const [videoBounds, setVideoBounds] = useState(null);

    useEffect(() => {
        const fetchOverlays = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/overlays');
                if (!response.ok) throw new Error('Failed to fetch overlays');
                const data = await response.json();
                setOverlays(data);
            } catch (error) {
                console.error('Error fetching overlays:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchOverlays();
    }, []);

    useEffect(() => {
        if (videoPlayerRef.current) {
            const videoRect = videoPlayerRef.current.getBoundingClientRect();
            setVideoBounds({
                left: 0,
                top: 0,
                right: videoRect.width,
                bottom: videoRect.height,
            });
        }
    }, [videoPlayerRef]);

    const handleCreateOrUpdate = async () => {
        if (!overlay.content || overlay.size.width <= 0 || overlay.size.height <= 0) {
            setError('All fields are required and size must be positive.');
            return;
        }

        setLoading(true);
        try {
            const response = selectedOverlayId
                ? await fetch(`http://localhost:5000/overlays/${selectedOverlayId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...overlay }),
                  })
                : await fetch('http://localhost:5000/overlays', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...overlay }),
                  });

            if (!response.ok) throw new Error('Failed to save overlay');

            const newOverlay = await response.json();
            if (selectedOverlayId) {
                setOverlays(overlays.map((ov) => (ov._id === selectedOverlayId ? { ...newOverlay, ...overlay } : ov)));
            } else {
                setOverlays([...overlays, { ...newOverlay, ...overlay }]);
            }

            // Reset overlay state after saving
            setOverlay({
                position: { x: 0, y: 0 },
                size: { width: 100, height: 100 },
                content: '',
                type: 'text',
            });
            setSelectedOverlayId(null);
            setError('');
        } catch (error) {
            console.error('Error saving overlay:', error);
            setError('Failed to save overlay. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ov) => {
        setOverlay({ position: ov.position, size: ov.size, content: ov.content, type: ov.type });
        setSelectedOverlayId(ov._id);
    };

    const handleDelete = async (overlay_id) => {
        if (window.confirm('Are you sure you want to delete this overlay?')) {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/overlays/${overlay_id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error('Failed to delete overlay');

                setOverlays(overlays.filter((ov) => ov._id !== overlay_id));
                setError('');
            } catch (error) {
                console.error('Error deleting overlay:', error);
                setError('Failed to delete overlay. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="livestream-container">
            <div ref={videoPlayerRef} className="video-player-container" style={{ position: 'relative' }}>
                <VideoPlayer className="video-player" style={{ width: '100%', height: 'auto' }} />

                {overlays.map((ov) => (
                    <Draggable
                        key={ov._id}
                        bounds="parent"
                        position={{ x: ov.position.x, y: ov.position.y }}
                        onStop={async (e, data) => {
                            const updatedOverlay = {
                                ...ov,
                                position: { x: data.x, y: data.y },
                            };
                            setOverlays(overlays.map((o) => (o._id === ov._id ? updatedOverlay : o)));

                            // Update position in backend
                            try {
                                const response = await fetch(`http://localhost:5000/overlays/${ov._id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updatedOverlay),  // Send the full updated overlay
                                });
                                if (!response.ok) throw new Error('Failed to save overlay position');
                                await response.json();
                            } catch (error) {
                                console.error('Error saving overlay position:', error);
                            }
                        }}
                    >
                        <div
                            className="overlay-item"
                            style={{
                                width: ov.size.width,
                                height: ov.size.height,
                                position: 'absolute',
                            }}
                        >
                            {ov.type === 'image' ? (
                                <img
                                    src={ov.content}
                                    alt="Overlay"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                // Allow editing of text overlay
                                <p>{ov.content}</p>
                            )}
                            
                            <button onClick={() => handleEdit(ov)} className="edit-button">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(ov._id)} className="delete-button">
                            🗑️
                            </button>
                        </div>
                    </Draggable>
                ))}
            </div>

            <div className="overlay-controls-container">
                {loading && <p className="loading">Loading...</p>}
                {error && <p className="error">{error}</p>}

                <div className="input-container">
                    <select
                        value={overlay.type}
                        onChange={(e) => setOverlay({ ...overlay, type: e.target.value })}
                        className="input-field"
                    >
                        <option value="text">Text Overlay</option>
                        <option value="image">Image Overlay</option>
                    </select>
                    {overlay.type === 'image' && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setOverlay({ ...overlay, content: URL.createObjectURL(e.target.files[0]) })}
                            className="input-field"
                        />
                    )}
                    {overlay.type === 'text' && (
                        <input
                            type="text"
                            placeholder="Overlay Content"
                            value={overlay.content}
                            onChange={(e) => setOverlay({ ...overlay, content: e.target.value })}
                            className="input-field"
                        />
                    )}
                    <input
                        type="number"
                        placeholder="Width"
                        value={overlay.size.width}
                        min="1"
                        onChange={(e) => setOverlay({ ...overlay, size: { ...overlay.size, width: parseInt(e.target.value) || 0 } })}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Height"
                        value={overlay.size.height}
                        min="1"
                        onChange={(e) => setOverlay({ ...overlay, size: { ...overlay.size, height: parseInt(e.target.value) || 0 } })}
                        className="input-field"
                    />
                    <button onClick={handleCreateOrUpdate} disabled={loading} className="submit-button">
                        {selectedOverlayId ? 'Update Overlay' : 'Create Overlay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OverlayControls;
