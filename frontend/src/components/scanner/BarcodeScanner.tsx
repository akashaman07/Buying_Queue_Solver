'use client';

import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { toast } from 'react-toastify';
import { stopAllCameraStreams } from '@/lib/utils/cameraUtils';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onError?: (error: any) => void;
  autoClose?: boolean;
}

export default function BarcodeScanner({ onDetected, onError, autoClose = true }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const videoStreamRef = useRef<MediaStream | null>(null);
  // Add a ref to track the last detected barcode and timestamp to prevent duplicates
  const lastDetectedRef = useRef<{barcode: string, timestamp: number} | null>(null);
  // Add a ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Set mounted ref on mount and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopScanner();
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, []);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        if (isMountedRef.current) {
          setCameras(videoDevices);
          if (videoDevices.length > 0) {
            setSelectedCamera(videoDevices[0].deviceId);
          }
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
        if (onError && isMountedRef.current) onError(error);
      }
    };

    if (navigator.mediaDevices) {
      getCameras();
    } else {
      toast.error('Browser does not support camera access');
      if (onError) onError(new Error('Browser does not support camera access'));
    }

    return () => {
      stopScanner();
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, [onError]);

  const startScanner = async () => {
    if (!scannerRef.current) return;

    try {
      await Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              width: 640,
              height: 480,
              facingMode: 'environment',
              deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
            },
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader', 'upc_reader'],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error('Error starting Quagga:', err);
            toast.error('Failed to start scanner: ' + err.message);
            if (onError) onError(err);
            return;
          }
          
          // Store reference to the video stream for proper cleanup
          const videoEl = scannerRef.current?.querySelector('video');
          if (videoEl && videoEl.srcObject instanceof MediaStream) {
            videoStreamRef.current = videoEl.srcObject;
          }
          
          Quagga.start();
          if (isMountedRef.current) {
            setIsStarted(true);
            setScanAttempts(0);
          }
          
          // Reset last detected barcode when starting scanner
          lastDetectedRef.current = null;
          
          // Set a timeout to show an alert if no barcode is detected within 5 seconds
          const timeout = setTimeout(() => {
            if (isStarted && isMountedRef.current) {
              toast.info('No barcode detected. Please try again or adjust the camera position.');
              setScanAttempts(prev => prev + 1);
              
              // If we've tried 3 times with no success, suggest manual entry
              if (scanAttempts >= 2) {
                toast.warning('Having trouble scanning? Try entering the barcode manually.');
              }
            }
          }, 5000);
          
          setScanTimeout(timeout);
        }
      );

      Quagga.onDetected((result) => {
        if (result && result.codeResult) {
          const code = result.codeResult.code;
          if (code) {
            // Check if this is a duplicate scan (same barcode within 2 seconds)
            const now = Date.now();
            if (
              lastDetectedRef.current && 
              lastDetectedRef.current.barcode === code && 
              now - lastDetectedRef.current.timestamp < 2000
            ) {
              // Skip duplicate detection
              return;
            }
            
            // Update last detected barcode and timestamp
            lastDetectedRef.current = { barcode: code, timestamp: now };
            
            // Clear the timeout since we detected a barcode
            if (scanTimeout) {
              clearTimeout(scanTimeout);
              setScanTimeout(null);
            }
            
            // Play a beep sound
            const beep = new Audio('/beep.mp3');
            beep.play().catch((e) => console.log('Audio play error:', e));
            
            // Pass the detected barcode to the parent component
            onDetected(code);
            
            // Auto-close the scanner if enabled
            if (autoClose) {
              // Make sure to stop the scanner immediately
              stopScanner();
              
              // Double-check after a short delay that the camera is really off
              setTimeout(() => {
                // Use our utility function to stop all camera streams
                stopAllCameraStreams();
                
                // Also try directly accessing the video stream reference
                if (videoStreamRef.current) {
                  console.log('Camera still on after detection, forcing shutdown');
                  videoStreamRef.current.getTracks().forEach(track => track.stop());
                  videoStreamRef.current = null;
                }
              }, 500);
              
              // One final check after a longer delay
              setTimeout(() => {
                stopAllCameraStreams();
              }, 2000);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing Quagga:', error);
      toast.error('Failed to initialize scanner');
      if (onError) onError(error);
    }
  };

  const stopScanner = () => {
    if (isStarted) {
      try {
        // Stop Quagga processing
        Quagga.stop();
        
        // Properly release the camera stream
        if (videoStreamRef.current) {
          videoStreamRef.current.getTracks().forEach(track => {
            if (track.kind === 'video') {
              console.log('Stopping video track:', track.label);
            }
            track.stop();
          });
          videoStreamRef.current = null;
        }
        
        // Also try to find and stop any video elements that might still have streams
        const videoEl = scannerRef.current?.querySelector('video');
        if (videoEl && videoEl.srcObject instanceof MediaStream) {
          const stream = videoEl.srcObject;
          stream.getTracks().forEach(track => {
            if (track.kind === 'video') {
              console.log('Stopping video track from video element:', track.label);
            }
            track.stop();
          });
          videoEl.srcObject = null;
          videoEl.pause();
          videoEl.load();
        }
        
        // Use our utility function to stop all camera streams
        stopAllCameraStreams();
        
        if (isMountedRef.current) {
          setIsStarted(false);
        }
        
        // Clear the timeout if it exists
        if (scanTimeout) {
          clearTimeout(scanTimeout);
          setScanTimeout(null);
        }
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  const toggleScanner = () => {
    if (isStarted) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    setSelectedCamera(deviceId);
    if (isStarted) {
      stopScanner();
      setTimeout(() => {
        startScanner();
      }, 300);
    }
  };

  // Ensure camera is stopped when component unmounts
  useEffect(() => {
    return () => {
      console.log('BarcodeScanner component unmounting, cleaning up resources');
      
      // Stop Quagga if it's running
      try {
        Quagga.stop();
      } catch (e) {
        console.error('Error stopping Quagga:', e);
      }
      
      // Stop any video streams
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => {
          console.log('Stopping track on unmount:', track.kind, track.label);
          track.stop();
        });
        videoStreamRef.current = null;
      }
      
      // Use our utility function to stop all camera streams
      stopAllCameraStreams();
      
      // Clear any timeouts
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full">
        <label htmlFor="camera-select" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Select Camera:
        </label>
        <div className="relative">
          <select
            id="camera-select"
            value={selectedCamera}
            onChange={handleCameraChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 font-medium shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {cameras.length === 0 && (
              <option value="">No cameras found</option>
            )}
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId} className="py-1 text-gray-800">
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div
        ref={scannerRef}
        className="relative w-full max-w-lg h-64 md:h-80 bg-black rounded-lg overflow-hidden border-2 border-blue-500"
      >
        {!isStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z" clipRule="evenodd" />
            </svg>
            <span className="text-lg font-bold">Click "Start Scanner" to begin scanning</span>
          </div>
        )}
        
        {isStarted && (
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={stopScanner}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 focus:outline-none"
              title="Close Camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={toggleScanner}
          className={`px-6 py-3 rounded-md font-semibold text-lg shadow-md flex items-center justify-center scan-button ${
            isStarted
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isStarted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop Scanner
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Start Scanner
            </>
          )}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-100 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="font-medium">Position the barcode within the scanner view to scan. Hold steady for best results.</p>
      </div>
    </div>
  );
}