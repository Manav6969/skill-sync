'use client';

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react'; // 1. Added useLayoutEffect
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

const TeamChatBox = ({ teamId }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  

  const [notes, setNotes] = useState(''); // 2. State for the live notes
  const textareaRef = useRef(null);       // 3. Ref to the textarea DOM element
  const cursorRef = useRef(0);            // 4. Ref to track cursor position
  
  const msgEndRef = useRef(null);
  const router = useRouter();

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

      // --- NEW: SOCKET LISTENER FOR NOTES ---
      socketInstance.on('notesUpdate', (updatedNotes) => {
        if (textareaRef.current) {
          cursorRef.current = textareaRef.current.selectionStart;
        }
        setNotes(updatedNotes);
      });

      socketInstance.on('loadPreviousMessages', (msgs) => {
        setMessages(msgs.map((msg) => ({
          text: msg.text,
          sender: msg.sender?.name,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      });

      socketInstance.on('newMessage', (msg) => {
        setMessages((prev) => [...prev, {
          text: msg.text,
          sender: msg.sender?.name,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      });

      setSocket(socketInstance);
      return () => socketInstance.disconnect();
    };

    setupSocket();
  }, [teamId]);

  // --- 5. THE MAGIC FIX: Restore cursor before browser paints ---
  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
    }
  }, [notes]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', { teamId, message: newMessage });
      setNewMessage('');
    }
  }, [newMessage, socket, teamId]);

  
  const handleNotesChange = (e) => {
    const val = e.target.value;
    cursorRef.current = e.target.selectionStart; 
    setNotes(val);
    socket?.emit('editNotes', { teamId, notes: val });
  };

  return (
    <div className="min-h-screen flex flex-col text-white bg-gradient-to-b from-black via-[#12001d] to-[#3a005a]">
      <div className="p-4 flex justify-between items-center border-b border-purple-700 bg-black/30 backdrop-blur-md shadow-md">
        <h2 className="text-xl font-bold tracking-wide">Team Chat & Notes</h2>
        <button onClick={() => router.push('/teams')} className="bg-purple-700 hover:bg-purple-800 text-sm px-4 py-1.5 rounded-lg transition">
          ← Back to Teams
        </button>
      </div>

      {/* --- LIVE NOTES AREA --- */}
      <div className="p-4 border-b border-purple-900/50">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleNotesChange}
          placeholder="Type team notes here... updates live!"
          className="w-full h-32 p-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`max-w-[75%] px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 shadow-md ${msg.sender === 'You' ? 'ml-auto text-right border border-purple-500' : 'text-left border border-white/10'}`}>
            <div className="text-sm font-semibold text-purple-300 mb-1">{msg.sender}</div>
            <div className="text-base">{msg.text}</div>
            <div className="text-xs text-purple-200 mt-2">{msg.time}</div>
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
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button onClick={sendMessage} className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg font-semibold transition">Send</button>
        </div>
      </div>
    </div>
  );
};

export default TeamChatBox;