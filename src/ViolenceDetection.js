import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, Settings2, Volume2, VolumeX } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';


const ViolenceDetection = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const [videoSource, setVideoSource] = useState(null);
  const chunks = useRef([]);

  const detectViolence = async (videoBlob) => {
    const formData = new FormData();
    formData.append('video', videoBlob);
    try {
      const response = await fetch('http://localhost:5000/api/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const data = await response.json();
      return data.isViolent;
    } catch (error) {
      console.error('Error during violence detection:', error);
      throw error;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsRecording(true);
        
        mediaRecorderRef.current = new MediaRecorder(stream);
        chunks.current = [];
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunks.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);
          setVideoSource(videoUrl);
          await processVideo(blob);
        };

        mediaRecorderRef.current.start(1000);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Stop any existing camera stream
      if (isRecording) {
        stopCamera();
      }
      
      // Create object URL for the uploaded video
      const videoUrl = URL.createObjectURL(file);
      setVideoSource(videoUrl);
      setUploadedVideo(videoUrl);
      
      // Set video source and autoplay
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
        videoRef.current.load();
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error('Error playing video:', err));
      }
      
      processVideo(file);
    }
  };
  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startAlarm = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/alarm_beeps.mp3');
      audioRef.current.loop = true;
    }
    audioRef.current.play();
    setIsAlarmPlaying(true);
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAlarmPlaying(false);
    }
  };

  const processVideo = async (videoData) => {
    setDetectionStatus('processing');
    try {
      const isViolent = await detectViolence(videoData);
      setDetectionStatus(isViolent ? 'violent' : 'safe');
      
      if (isViolent) {
        startAlarm();
      }
    } catch (error) {
      setDetectionStatus('error');
      console.error('Error processing video:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <Card className="max-w-4xl mx-auto shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings2 className="w-6 h-6 text-blue-600 animate-spin-slow" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Violence Detection System
            </CardTitle>
          </div>
          <p className="text-gray-500 text-sm">Advanced video analysis for Violence Detection</p>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-inner bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <video
              ref={videoRef}
              className="w-full h-full object-cover cursor-pointer"
              playsInline
              onClick={handleVideoClick}
              controls={!!uploadedVideo}
            />
            {!isRecording && !uploadedVideo && !detectionStatus && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No video input</p>
              </div>
            )}
            {detectionStatus === 'processing' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white space-y-2 text-center">
                  <Settings2 className="w-8 h-8 animate-spin mx-auto" />
                  <p>Processing...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={isRecording ? stopCamera : startCamera}
              className={`${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
              } shadow-lg transition-all duration-200 min-w-[160px]`}
              disabled={!!uploadedVideo}
            >
              <Camera className="mr-2 h-4 w-4" />
              {isRecording ? 'Stop Camera' : 'Start Camera'}
            </Button>
            
            <div className="relative">
              <Button 
                variant="outline" 
                className="shadow-lg hover:shadow-xl transition-all duration-200 border-2 min-w-[160px]"
                disabled={isRecording}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </Button>
            </div>

            {isAlarmPlaying && (
              <Button
                onClick={stopAlarm}
                className="bg-red-600 hover:bg-red-700 shadow-red-500/30 shadow-lg transition-all duration-200 min-w-[160px] animate-pulse"
              >
                <VolumeX className="mr-2 h-4 w-4" />
                Stop Alarm
              </Button>
            )}
          </div>

          {detectionStatus && (
            <Alert 
              variant={detectionStatus === 'violent' ? 'destructive' : 'default'}
              className={`shadow-lg transition-all duration-300 ${
                detectionStatus === 'violent' 
                  ? 'bg-red-50 border-red-200' 
                  : detectionStatus === 'safe' 
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
              }`}
            >
              {detectionStatus === 'processing' ? (
                <>
                  <Settings2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <AlertTitle className="text-blue-800">Processing Video</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    Analyzing content for potential violence...
                  </AlertDescription>
                </>
              ) : detectionStatus === 'violent' ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-800">Violence Detected!</AlertTitle>
                  <AlertDescription className="text-red-600">
                    Warning: Violent content has been detected.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-800">Content Safe</AlertTitle>
                  <AlertDescription className="text-green-600">
                    No violence detected in the content.
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViolenceDetection;