'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const TeamChatBox = ({ teamId }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const isMounted = useRef(true);

  useEffect(() => {
        const isloggedin = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/userAuthentication`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!(res.ok)) {
                let token = localStorage.getItem('access_token');
                if (token) {
                    localStorage.removeItem('access_token');
                }
                const logres = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                    method: 'GET',
                    credentials: 'include',
                });
                router.replace('/login')
            }
        }

        isloggedin()

    }, [])

  useEffect(() => {
    isMounted.current = true;
let ws = null;
let reconnectTimeout = null;

const connectSocket = async () => {
  /* Keep your existing token fetching and refresh logic up to line 50 */
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
     ws.send(JSON.stringify({ type: 'auth', payload: { token } }));
  };

  ws.onmessage = (event) => {
     const { type, payload } = JSON.parse(event.data);
     
     if (type === 'authSuccess') {
         ws.send(JSON.stringify({ type: 'joinAllChat' }));
     } 
     else if (type === 'loadPreviousMessages') {
         setMessages(payload.map((msg) => ({
             text: msg.text,
             sender: msg.sender?.name,
             time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         })));
     } 
     else if (type === 'newAllMessage') {
         setMessages((prev) => [...prev, {
             text: payload.text,
             sender: payload.sender?.name,
             time: new Date(payload.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         }]);
     }
  };

  ws.onclose = () => {
     if (isMounted.current) {
         console.log("Global chat connection lost, retrying...");
         reconnectTimeout = setTimeout(connectSocket, 3000);
     }
  };

  setSocket(ws);
};

connectSocket();

return () => {
    isMounted.current = false;
    clearTimeout(reconnectTimeout);
    if (ws) ws.close();
};
    
    setupSocket();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (newMessage.trim() && socket) {
      socket.send(JSON.stringify({ 
  type: 'sendAllMessage', 
  payload: { message: newMessage } 
}));
      setNewMessage('');
    }
  }, [newMessage, socket]);

  return (
    <div className="min-h-screen flex flex-col text-white bg-gradient-to-b from-black via-[#12001d] to-[#3a005a]">
      <div className="p-4 flex justify-between items-center border-b border-purple-700 bg-black/30 backdrop-blur-md shadow-md">
        <h2 className="text-xl font-bold tracking-wide">Team Chat</h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-purple-700 hover:bg-purple-800 text-sm px-4 py-1.5 rounded-lg transition"
        >
          ← Back to DashBoard
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[75%] px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 shadow-md ${
              msg.sender === 'You'
                ? 'ml-auto text-right border border-purple-500'
                : 'text-left border border-white/10'
            }`}
          >
            <div className="text-sm font-semibold text-purple-300 mb-1">{msg.sender}</div>
            <div className="text-base">{msg.text}</div>
            <div className="text-xs text-purple-200 mt-2">{msg.time}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-purple-700 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message"
            onKeyDown={(e) => {
              if(e.key === "Enter" && !e.shiftKey)
              {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            
          />
          <button
            onClick={sendMessage}
            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg font-semibold transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamChatBox