'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

const TeamChatBox = ({ teamId }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const msgEndRef = useRef(null);
  const router = useRouter();

  // The Hard Part: Queue reference for Auto-Sync
  const failedQueue = useRef([]);

  useEffect(() => {
    const setupSocket = async () => {
      let token = localStorage.getItem('access_token');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.accessToken);
        token = data.accessToken;
      }

      const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
        auth: { token },
      });

      socketInstance.emit('joinTeamRoom', teamId);

      socketInstance.on('loadPreviousMessages', (msgs) => {
        setMessages(
          msgs.map((msg) => ({
            id: msg._id, // Mapping the db ID
            text: msg.text,
            sender: msg.sender?.name,
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: 'sent', // Pre-existing messages are already sent
          }))
        );
      });

      // Receive messages from coworkers
      socketInstance.on('newMessage', (msg) => {
        setMessages((prev) => [
          ...prev,
          {
            id: msg._id || Date.now().toString(),
            text: msg.text,
            sender: msg.sender?.name,
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: 'sent',
          },
        ]);
      });

      // Socket Reconnection Event: Auto-Sync dispatch queue
      socketInstance.on('connect', () => {
        if (failedQueue.current.length > 0) {
          const pending = [...failedQueue.current];
          failedQueue.current = []; // Clear current queue, it will be refilled if it fails again
          
          // Re-attempt in chronological order
          pending.forEach((msg) => {
            updateMessageStatus(msg.id, 'sending');
            attemptSend(socketInstance, msg);
          });
        }
      });

      setSocket(socketInstance);
      return () => socketInstance.disconnect();
    };

    setupSocket();
  }, [teamId]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateMessageStatus = (id, newStatus) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
  };

  // Helper method to emit and handle timeouts
  const attemptSend = (socketInstance, msgNode) => {
    // If already offline, immediately mark as failed — don't rely on Socket.io's buffer
    if (!socketInstance.connected) {
      updateMessageStatus(msgNode.id, 'failed');
      if (!failedQueue.current.find((m) => m.id === msgNode.id)) {
        failedQueue.current.push(msgNode);
        failedQueue.current.sort((a, b) => a.timestamp - b.timestamp);
      }
      return;
    }

    socketInstance.timeout(3000).emit('sendMessage', { teamId, message: msgNode.text, tempId: msgNode.id }, (err, response) => {
        if (err) {
          // Failure State: No DB acknowledgement in 3 seconds OR Offline
          updateMessageStatus(msgNode.id, 'failed');
          
          if (!failedQueue.current.find((m) => m.id === msgNode.id)) {
            failedQueue.current.push(msgNode);
            failedQueue.current.sort((a, b) => a.timestamp - b.timestamp);
          }
        } else {
          // Success State
          updateMessageStatus(msgNode.id, 'sent');
          failedQueue.current = failedQueue.current.filter((m) => m.id !== msgNode.id);
        }
      }
    );
  };

  const sendMessage = useCallback(() => {
    if (newMessage.trim() && socket) {
      // 1. Instantly construct the optimistic UI message
      const tempId = Date.now().toString(); // Use as provisional ID until backend responds
      const optimisticMsg = {
        id: tempId,
        text: newMessage,
        sender: 'You',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'sending', // Initialize greyed out state
        timestamp: Date.now(),
      };

      // 2. Render instantly
      setMessages((prev) => [...prev, optimisticMsg]);
      setNewMessage('');

      // 3. Forward to the backend verification
      attemptSend(socket, optimisticMsg);
    }
  }, [newMessage, socket, teamId]);

  const handleRetry = (msg) => {
    updateMessageStatus(msg.id, 'sending');
    failedQueue.current = failedQueue.current.filter((m) => m.id !== msg.id);
    attemptSend(socket, msg);
  };

  return (
    <div className="min-h-screen flex flex-col text-white bg-gradient-to-b from-black via-[#12001d] to-[#3a005a]">
      <div className="p-4 flex justify-between items-center border-b border-purple-700 bg-black/30 backdrop-blur-md shadow-md">
        <h2 className="text-xl font-bold tracking-wide">Team Chat</h2>
        <button
          onClick={() => router.push('/teams')}
          className="bg-purple-700 hover:bg-purple-800 text-sm px-4 py-1.5 rounded-lg transition"
        >
          ← Back to Teams
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className="flex flex-col">
            <div
              className={`max-w-[75%] px-4 py-3 rounded-xl backdrop-blur-md shadow-md transition-all duration-300 ${
                msg.sender === 'You'
                  ? 'ml-auto text-right border border-purple-500'
                  : 'text-left border border-white/10'
              } 
              ${msg.status === 'sending' ? 'opacity-50 bg-white/5 saturate-50' : 'bg-white/10'} 
              ${msg.status === 'failed' ? 'border-red-500 bg-red-900/30 shadow-red-500/20' : ''}`}
            >
              <div className="text-sm font-semibold text-purple-300 mb-1">{msg.sender}</div>
              <div className="text-base">{msg.text}</div>
              
              <div className="text-xs text-purple-200 mt-2 flex justify-end items-center gap-2">
                {msg.status === 'sending' && (
                  <span className="italic text-gray-400 font-medium tracking-wide text-[10px]">Sending...</span>
                )}
                <span>{msg.time}</span>
              </div>
            </div>
            
            {/* The visually appealing explicit Retry button requested in Acceptance criteria */}
            {msg.status === 'failed' && (
              <button
                onClick={() => handleRetry(msg)}
                className="mt-2 ml-auto text-xs bg-red-600/90 hover:bg-red-500 hover:-translate-y-[1px] active:translate-y-0 text-white font-medium px-4 py-1.5 rounded-md transition duration-200 shadow-md shadow-red-500/20"
              >
                Failed to Send: Retry
              </button>
            )}
          </div>
        ))}
        <div ref={msgEndRef} />
      </div>

      <div className="p-4 border-t border-purple-700 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all border border-transparent focus:border-purple-400"
          />
          <button
            onClick={sendMessage}
            className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold transition active:scale-95 shadow-lg shadow-purple-600/30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamChatBox;
