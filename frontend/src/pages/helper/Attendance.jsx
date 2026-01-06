import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, XCircle, Scan } from "lucide-react";
import API from "../../services/api";

export default function AttendancePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    checkFace();
    fetchHistory();
    fetchAssignedJobs();
  }, []);

  const fetchAssignedJobs = async () => {
    try {
      const res = await API.get('/auth/helper/assigned-jobs');
      setAssignedJobs(res.data || []);
      if (res.data && res.data.length) setSelectedJobId(res.data[0].jobId);
    } catch (err) {
      console.error('Failed to fetch assigned jobs', err);
    }
  }; 

  useEffect(() => {
    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
      setScanning(false);
      setVerified(null);
    }

    return () => {
      // ensure camera is stopped on unmount
      stopCamera();
    };
  }, [cameraOn]);

  // ensure camera stays stopped when the page is hidden or blurred while camera is off
  useEffect(() => {
    const enforceStopped = () => {
      if (!cameraOn) stopCamera();
    };
    document.addEventListener('visibilitychange', enforceStopped);
    window.addEventListener('blur', enforceStopped);
    return () => {
      document.removeEventListener('visibilitychange', enforceStopped);
      window.removeEventListener('blur', enforceStopped);
    };
  }, [cameraOn]);

  // listen for global stop events (fired on route change or logout)
  useEffect(() => {
    const onStop = () => stopCamera();
    window.addEventListener('stopCamera', onStop);
    return () => window.removeEventListener('stopCamera', onStop);
  }, []);

  const startCamera = async () => {
    try {
      // don't re-open if already started
      if (streamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  const stopCamera = () => {
    try {
      const stream = streamRef.current || videoRef.current?.srcObject;
      if (!stream) return;

      // disable then stop all tracks
      stream.getTracks().forEach((t) => {
        try { t.enabled = false; } catch (e) {}
        try { t.stop(); } catch (e) {}
      });

      // clear refs and element sources
      streamRef.current = null;
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch (e) {}
        try { videoRef.current.srcObject = null; } catch (e) {}
        try { videoRef.current.src = ""; videoRef.current.load(); } catch (e) {}
      }

      // double-check after a short delay and force-stop any remaining tracks
      setTimeout(() => {
        try {
          const s2 = streamRef.current || videoRef.current?.srcObject;
          if (s2) {
            s2.getTracks().forEach((t) => {
              try { t.enabled = false; } catch (e) {}
              try { t.stop(); } catch (e) {}
            });
            streamRef.current = null;
            if (videoRef.current) {
              try { videoRef.current.pause(); videoRef.current.srcObject = null; videoRef.current.src = ""; videoRef.current.load(); } catch (e) {}
            }
          }
        } catch (err) {
          console.error('Error during camera double-stop', err);
        }
      }, 500);
    } catch (err) {
      console.error('stopCamera error', err);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    if (!video || !video.srcObject || video.videoWidth === 0 || video.videoHeight === 0) return null;
    const canvas = canvasRef.current;
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg");
  }; 

  const checkFace = async () => {
    try {
      const res = await API.get("/attendance/face");
      setFaceRegistered(!!res.data);
    } catch (err) {
      console.error(err);
      setFaceRegistered(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/attendance/helper");
      setAttendanceHistory(res.data);
      // derive checkedIn state from last action
      setCheckedIn(res.data[0]?.action === 'check-in');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    const image = captureImage();
    if (!image) return alert('Unable to capture image');
    try {
      setScanning(true);
      await API.post('/attendance/register-face', { image });
      setFaceRegistered(true);
      alert('Face registered successfully');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Registration failed');
    } finally {
      setScanning(false);
    }
  };

  const handleScan = async (action) => {
    if (!faceRegistered) return alert('Please register your face first');
    const image = captureImage();
    if (!image) return alert('Unable to capture image');

    setScanning(true);
    setVerified(null);

    // get location
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const payload = { action, image, lat: pos.coords.latitude, lon: pos.coords.longitude, jobId: selectedJobId || null };
        const res = await API.post('/attendance/scan', payload);
        setVerified(true);
        await fetchHistory();
      } catch (err) {
        console.error(err);
        setVerified(false);
        alert(err?.response?.data?.error || 'Verification failed');
      } finally {
        setScanning(false);
        setTimeout(()=>setVerified(null), 2000);
      }
    }, (err) => {
      console.error('Location error', err);
      alert('Location access is required to mark attendance');
      setScanning(false);
    });
  }; 

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Face Recognition Attendance</h1>
        <p className="text-gray-600">Secure and accurate attendance tracking with AI</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Face Scan</h2>

          <div className="relative mb-6">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />

              <div className={`absolute inset-0 rounded-full border-4 flex items-center justify-center transition-all ${
                scanning ? 'border-blue-500 animate-pulse' : !cameraOn ? 'border-gray-400' : verified === true ? 'border-green-500' : verified === false ? 'border-red-500' : 'border-gray-600'
              }`}>
                {!cameraOn ? (
                  <CameraOff className="w-32 h-32 text-gray-500" />
                ) : verified === true ? (
                  <CheckCircle2 className="w-32 h-32 text-green-500" />
                ) : verified === false ? (
                  <XCircle className="w-32 h-32 text-red-500" />
                ) : (
                  <Camera className="w-32 h-32 text-gray-600" />
                )}
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              {!cameraOn && (
                <div className="px-6 py-3 rounded-full bg-gray-700 text-white font-medium shadow-lg">
                  Camera Off
                </div>
              )}
              {cameraOn && scanning && (
                <div className="px-6 py-3 rounded-full bg-blue-500 text-white font-medium shadow-lg">
                  <Scan className="w-5 h-5 inline-block mr-2 animate-pulse" />
                  Scanning face...
                </div>
              )}
              {cameraOn && verified === true && (
                <div className="px-6 py-3 rounded-full bg-green-500 text-white font-medium shadow-lg">
                  <CheckCircle2 className="w-5 h-5 inline-block mr-2" />
                  Face Verified ✓
                </div>
              )}
              {cameraOn && verified === false && (
                <div className="px-6 py-3 rounded-full bg-red-500 text-white font-medium shadow-lg">
                  <XCircle className="w-5 h-5 inline-block mr-2" />
                  Verification Failed
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Job</label>
            <select value={selectedJobId || ''} onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : null)} className="w-full p-3 border rounded mb-4">
              <option value="">No job / Not assigned</option>
              {assignedJobs.map((j) => (
                <option key={j.jobId} value={j.jobId}>{j.title} {j.date ? `• ${j.date}` : ''}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!faceRegistered ? (
              <button onClick={handleRegister} disabled={scanning} className="py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg transition-all">Register Face</button>
            ) : (
              <>
                <button onClick={() => handleScan('check-in')} disabled={scanning || checkedIn} className="py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">Check In</button>
                <button onClick={() => handleScan('check-out')} disabled={scanning || !checkedIn} className="py-4 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">Check Out</button>
              </>
            )}
          </div> 

          <div className="mt-4 text-center">
            <button onClick={() => setCameraOn((p) => !p)} className="py-3 px-6 rounded-xl bg-gray-800 text-white font-medium hover:shadow-lg transition-all">
              {cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${checkedIn ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{checkedIn ? 'Checked In' : 'Not Checked In'}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Attendance History</h2>
          <div className="space-y-3">
            {attendanceHistory.map((record, index) => (
              <div key={index} className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{new Date(record.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">{record.action === 'check-in' ? 'In' : 'Out'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Location: {record.lat ? `${record.lat.toFixed(4)}, ${record.lon.toFixed(4)}` : 'Unknown'}</span>
                  <span>Job: {record.jobTitle || (record.jobId ? `#${record.jobId}` : '—')}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">At: {new Date(record.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes animate-scan { 0% { transform: scaleX(0) } 100% { transform: scaleX(1) } }`}</style>
    </div>
  );
}