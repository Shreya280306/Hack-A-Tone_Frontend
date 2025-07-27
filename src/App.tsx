import { useRef, useState } from 'react';
import './App.css';

function App() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [apiAudioURL, setApiAudioURL] = useState<string | null>(null);
  const [language, setLanguage] = useState('hi-IN');
  const [uploadStatus, setUploadStatus] = useState<{ message: string; color: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Removed fetchApiAudio, will use upload response directly

  const handleStartRecording = async () => {
    setAudioURL(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) {
      alert('No audio recorded to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('language', language);
    try {
      const response = await fetch('http://localhost:8000/upload-audio/', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setApiAudioURL(url);
        setUploadStatus({ message: 'Audio uploaded successfully', color: 'green' });
      } else {
        setUploadStatus({ message: 'Upload failed.', color: 'red' });
      }
    } catch (error) {
      setUploadStatus({ message: 'Error uploading audio.', color: 'red' });
    }
  };


  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="App">
    <h1>Gram Sahayak</h1>
      <h3>Audio Only Chatbot</h3>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="language-select" style={{ marginRight: '8px' }}>Select Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="hi-IN">Hindi (hi-IN)</option>
          <option value="bn-IN">Bengali (bn-IN)</option>
          <option value="ta-IN">Tamil (ta-IN)</option>
          <option value="te-IN">Telugu (te-IN)</option>
          <option value="gu-IN">Gujarati (gu-IN)</option>
          <option value="kn-IN">Kannada (kn-IN)</option>
          <option value="ml-IN">Malayalam (ml-IN)</option>
          <option value="mr-IN">Marathi (mr-IN)</option>
          <option value="pa-IN">Punjabi (pa-IN)</option>
          <option value="or-IN">Odia (or-IN)</option>
          <option value="en-IN">English (en-IN)</option>
        </select>
      </div>
      <button onClick={handleStartRecording} disabled={recording} style={{ marginRight: '10px' }}>
        🎤 Mic
      </button>
      <button onClick={handleStopRecording} disabled={!recording}>
        Stop Recording
      </button>
      <div style={{ marginTop: '20px' }}>
        {uploadStatus && (
          <div style={{ color: uploadStatus.color, marginBottom: '10px' }}>{uploadStatus.message}</div>
        )}
        {audioURL && (
          <>
            <audio src={audioURL} controls />
            <br />
            <a href={audioURL} download="recording.webm">
              <button>Download Audio</button>
            </a>
            <button style={{ marginLeft: '10px' }} onClick={handleUpload}>Upload Audio</button>
          </>
        )}
        {apiAudioURL && (
          <div style={{ marginTop: '20px' }}>
            <audio src={apiAudioURL} controls />
            <br />
            <a href={apiAudioURL} download="api_audio.wav">
              <button>Download Response Audio</button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
