/**
 * Utility functions for camera management
 */

/**
 * Forcefully stops all active camera streams in the application
 * @returns {Promise<void>}
 */
export const stopAllCameraStreams = async (): Promise<void> => {
  console.log('Forcefully stopping all camera streams');
  
  // Stop all video elements with active streams
  document.querySelectorAll('video').forEach(video => {
    if (video.srcObject instanceof MediaStream) {
      const stream = video.srcObject;
      stream.getTracks().forEach(track => {
        console.log('Stopping track from video element:', track.kind, track.label);
        track.stop();
      });
      video.srcObject = null;
      video.pause();
    }
  });
  
  // Try to get any active media devices and log them
  try {
    if (navigator.mediaDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log(`Found ${videoDevices.length} video input devices`);
      videoDevices.forEach(device => {
        console.log('Video device:', device.label || 'Unnamed device');
      });
    }
  } catch (error) {
    console.error('Error checking media devices:', error);
  }
  
  // Force a garbage collection hint (though this is just a hint to the browser)
  if (typeof window !== 'undefined' && (window as any).gc) {
    (window as any).gc();
  }
};

/**
 * Checks if the camera is currently active
 * @returns {boolean} True if camera is active, false otherwise
 */
export const isCameraActive = (): boolean => {
  let isActive = false;
  
  // Check if any video elements have active streams
  document.querySelectorAll('video').forEach(video => {
    if (
      video.srcObject instanceof MediaStream && 
      video.srcObject.getVideoTracks().some(track => track.readyState === 'live')
    ) {
      isActive = true;
    }
  });
  
  return isActive;
};

/**
 * Attaches event listeners to ensure camera is stopped when page is hidden or closed
 */
export const setupCameraCleanupListeners = (): () => void => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      stopAllCameraStreams();
    }
  };
  
  const handleBeforeUnload = () => {
    stopAllCameraStreams();
  };
  
  // Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}; 