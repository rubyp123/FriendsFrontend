// // frontend/src/features/call/VideoCall.jsx
// import { useCallback, useEffect, useRef, useState } from "react";
// import { getSocket } from "../../socket";

// const ICE_SERVERS = [
//   { urls: "stun:stun.l.google.com:19302" },
//   // In production add your TURN server (coturn) for reliability:
//   // { urls: "turn:your-turn-host:3478", username: "user", credential: "pass" },
// ];

// export default function VideoCall({ roomId }) {
//   const socketRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const remoteStreamRef = useRef(new MediaStream());

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   const [inCall, setInCall] = useState(false);
//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [connecting, setConnecting] = useState(false);

//   // attach streams to video elements
//   useEffect(() => {
//     if (localVideoRef.current && localStreamRef.current) {
//       localVideoRef.current.srcObject = localStreamRef.current;
//     }
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = remoteStreamRef.current;
//     }
//   }, [inCall]);

//   const ensurePC = useCallback(() => {
//     if (pcRef.current) return pcRef.current;
//     const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

//     pc.onicecandidate = (e) => {
//       if (e.candidate) {
//         socketRef.current?.emit("webrtc:ice-candidate", {
//           roomId,
//           candidate: e.candidate,
//         });
//       }
//     };

//     pc.ontrack = (e) => {
//       // add remote tracks to one MediaStream
//       e.streams[0].getTracks().forEach((t) => {
//         if (!remoteStreamRef.current.getTracks().find((rt) => rt.id === t.id)) {
//           remoteStreamRef.current.addTrack(t);
//         }
//       });
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = remoteStreamRef.current;
//       }
//     };

//     pc.onconnectionstatechange = () => {
//       const st = pc.connectionState;
//       if (st === "disconnected" || st === "failed" || st === "closed") {
//         // teardown on failure
//         endCall();
//       }
//     };

//     pcRef.current = pc;
//     return pc;
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [roomId]);

//   const getLocalStream = useCallback(async () => {
//     if (localStreamRef.current) return localStreamRef.current;
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: { width: { ideal: 1280 }, height: { ideal: 720 } },
//     });
//     localStreamRef.current = stream;
//     if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//     return stream;
//   }, []);

//   const addLocalTracks = useCallback(async (pc) => {
//     const stream = await getLocalStream();
//     stream.getTracks().forEach((t) => {
//       pc.addTrack(t, stream);
//     });
//   }, [getLocalStream]);

//   const startCall = useCallback(async () => {
//     try {
//       setConnecting(true);
//       const socket = getSocket();
//       socketRef.current = socket;

//       // create pc + local tracks
//       const pc = ensurePC();
//       await addLocalTracks(pc);

//       // create offer
//       const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
//       await pc.setLocalDescription(offer);

//       // send offer
//       socket.emit("webrtc:offer", { roomId, sdp: offer });

//       setInCall(true);
//       setConnecting(false);
//     } catch (err) {
//       console.error("[startCall] failed", err);
//       setConnecting(false);
//     }
//   }, [roomId, ensurePC, addLocalTracks]);

//   const acceptOffer = useCallback(async (sdp) => {
//     const pc = ensurePC();
//     await pc.setRemoteDescription(new RTCSessionDescription(sdp));
//     await addLocalTracks(pc);

//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     socketRef.current?.emit("webrtc:answer", { roomId, sdp: answer });
//     setInCall(true);
//   }, [roomId, ensurePC, addLocalTracks]);

//   const acceptAnswer = useCallback(async (sdp) => {
//     const pc = ensurePC();
//     await pc.setRemoteDescription(new RTCSessionDescription(sdp));
//   }, [ensurePC]);

//   const addCandidate = useCallback(async (candidate) => {
//     try {
//       const pc = ensurePC();
//       await pc.addIceCandidate(new RTCIceCandidate(candidate));
//     } catch (e) {
//       console.warn("addIceCandidate failed", e);
//     }
//   }, [ensurePC]);

//   const endCall = useCallback(() => {
//     // notify (optional)
//     socketRef.current?.emit("webrtc:leave", { roomId });

//     // close pc
//     try {
//       pcRef.current?.getSenders()?.forEach((s) => s.track && s.track.stop());
//       pcRef.current?.close();
//     } catch {console.log("Error")}
//     pcRef.current = null;

//     // stop local stream
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//       localStreamRef.current = null;
//     }

//     // clear remote stream
//     remoteStreamRef.current.getTracks().forEach((t) => remoteStreamRef.current.removeTrack(t));

//     setInCall(false);
//     setMicOn(true);
//     setCamOn(true);
//     setConnecting(false);
//   }, [roomId]);

//   // Socket listeners
//   useEffect(() => {
//     const socket = getSocket();
//     socketRef.current = socket;

//     // join signaling room
//     socket.emit("webrtc:join", { roomId });

//     const onOffer = async ({ sdp }) => {
//       await acceptOffer(sdp);
//     };
//     const onAnswer = async ({ sdp }) => {
//       await acceptAnswer(sdp);
//     };
//     const onIce = async ({ candidate }) => {
//       await addCandidate(candidate);
//     };
//     const onPeerLeft = () => {
//       endCall();
//     };

//     socket.on("webrtc:offer", onOffer);
//     socket.on("webrtc:answer", onAnswer);
//     socket.on("webrtc:ice-candidate", onIce);
//     socket.on("webrtc:peer-left", onPeerLeft);

//     return () => {
//       socket.emit("webrtc:leave", { roomId });
//       socket.off("webrtc:offer", onOffer);
//       socket.off("webrtc:answer", onAnswer);
//       socket.off("webrtc:ice-candidate", onIce);
//       socket.off("webrtc:peer-left", onPeerLeft);
//       endCall();
//     };
//   }, [roomId, acceptOffer, acceptAnswer, addCandidate, endCall]);

//   // Mic / Cam toggles
//   const toggleMic = () => {
//     const stream = localStreamRef.current;
//     if (!stream) return;
//     stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
//     setMicOn(stream.getAudioTracks().every((t) => t.enabled));
//   };

//   const toggleCam = () => {
//     const stream = localStreamRef.current;
//     if (!stream) return;
//     stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
//     setCamOn(stream.getVideoTracks().every((t) => t.enabled));
//   };

//   return (
//     <div className="flex h-full flex-col">
//       {/* Videos */}
//       <div className="flex-1 grid grid-cols-1 md:grid-cols-1 gap-3 p-3">
//         <div className=" relative rounded-xl overflow-hidden bg-black">
//           <video
//             ref={localVideoRef}
//             autoPlay
//             playsInline
//             muted
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute bottom-2 left-2 text-xs text-white/80 bg-black/40 px-2 py-1 rounded">
//             You
//           </div>
//         </div>

//         <div className="relative rounded-xl overflow-hidden bg-black">
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute bottom-2 left-2 text-xs text-white/80 bg-black/40 px-2 py-1 rounded">
//             Remote
//           </div>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
//         <div className="flex items-center gap-3 justify-center">
//           {!inCall ? (
//             <button
//               disabled={connecting}
//               onClick={startCall}
//               className="px-5 py-2 rounded-full text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60"
//             >
//               {connecting ? "Connecting..." : "Start Call"}
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={toggleMic}
//                 className={`px-4 py-2 rounded-full ${
//                   micOn ? "bg-gray-200 dark:bg-gray-800" : "bg-red-500 text-white"
//                 }`}
//               >
//                 {micOn ? "Mic On" : "Mic Off"}
//               </button>
//               <button
//                 onClick={toggleCam}
//                 className={`px-4 py-2 rounded-full ${
//                   camOn ? "bg-gray-200 dark:bg-gray-800" : "bg-red-500 text-white"
//                 }`}
//               >
//                 {camOn ? "Cam On" : "Cam Off"}
//               </button>
//               <button
//                 onClick={endCall}
//                 className="px-5 py-2 rounded-full text-white bg-red-600 hover:bg-red-700"
//               >
//                 End
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



const VideoCall = () => {
    return <>
       <div>
          Coming Soon...
       </div>
    </>;
}

export default VideoCall;