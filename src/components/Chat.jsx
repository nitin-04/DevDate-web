import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../api/apiClient';
import { createSocketConnection } from '../utils/socket';
import { toast } from 'react-toastify';
import {
  LuArrowLeft,
  LuSend,
  LuShieldAlert,
  LuBriefcase,
  LuSparkles,
  LuUsers,
  LuCheckCheck,
  LuGithub,
  LuLinkedin,
} from 'react-icons/lu';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// WhatsApp-style date divider formatter
const formatDateDivider = (dateString) => {
  if (!dateString) return '';
  const msgDate = new Date(dateString);
  const now = new Date();

  // Compare calendar days ignoring time
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate(),
  );

  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((today - messageDay) / oneDayMs);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return msgDate.toLocaleDateString(undefined, { weekday: 'long' });
  }

  return msgDate.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: msgDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const isDifferentDay = (currentDateStr, prevDateStr) => {
  if (!currentDateStr) return false;
  if (!prevDateStr) return true;
  const current = new Date(currentDateStr);
  const prev = new Date(prevDateStr);
  return (
    current.getFullYear() !== prev.getFullYear() ||
    current.getMonth() !== prev.getMonth() ||
    current.getDate() !== prev.getDate()
  );
};

const Chat = () => {
  const { targetUserId } = useParams();
  const user = useSelector((store) => store.user);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Ensure window starts at the top when entering chat
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [targetUserId]);

  // Auto-scroll message stream to latest message without scrolling the window
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  // 1. Fetch Chat History & Validate Connection Guard
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!targetUserId) return;
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/chat/${targetUserId}`);
        setTargetUser(res.data.targetUser);
        setMessages(res.data.messages || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          'Failed to load chat. You may only chat with accepted connections.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [targetUserId]);

  // 2. Setup Socket.io Real-Time Connection
  useEffect(() => {
    if (!user?._id || !targetUserId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit('joinChat', {
        userId: user._id,
        targetUserId,
      });
    };

    socket.on('connect', joinRoom);
    if (socket.connected) {
      joinRoom();
    }

    // Listen for new messages
    const handleReceive = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    // Listen for typing indicator
    const handleTyping = ({ isTyping }) => {
      setIsTyping(isTyping);
    };

    // Listen for socket errors (e.g. not connected)
    const handleChatError = ({ message }) => {
      setError(message);
      toast.error(message);
    };

    socket.on('receiveMessage', handleReceive);
    socket.on('userTyping', handleTyping);
    socket.on('chatError', handleChatError);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('receiveMessage', handleReceive);
      socket.off('userTyping', handleTyping);
      socket.off('chatError', handleChatError);
    };
  }, [user?._id, targetUserId]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current || !user?._id) return;

    socketRef.current.emit('typing', {
      senderId: user._id,
      targetUserId,
      isTyping: true,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('typing', {
          senderId: user._id,
          targetUserId,
          isTyping: false,
        });
      }
    }, 1500);
  };

  // Send Message Handler
  const handleSendMessage = (e) => {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || !socketRef.current || !user?._id) return;

    socketRef.current.emit('sendMessage', {
      senderId: user._id,
      targetUserId,
      text,
    });

    setNewMessage('');
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        senderId: user._id,
        targetUserId,
        isTyping: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-24 pb-8 px-4 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">
          Opening secure chat channel...
        </p>
      </div>
    );
  }

  // Unauthorized State (Users are not connected)
  if (error) {
    return (
      <div className="max-w-xl mx-auto pt-24 pb-8 px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <LuShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Connection Required
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          </div>
          <div className="pt-2">
            <Link
              to="/connections"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <LuUsers className="w-4 h-4" />
              <span>Back to Connections</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const effectiveLinkedIn = targetUser?.linkedInUrl || targetUser?.linkedinUrl;

  return (
    <div className="max-w-5xl mx-auto pt-20 sm:pt-22 pb-4 px-2 sm:px-6 lg:px-8">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-7rem)] max-h-[850px]">
        {/* Chat Header */}
        <div className="px-5 py-4 bg-slate-950/70 border-b border-slate-800/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <Link
              to="/messages"
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
              title="Back to Messages"
            >
              <LuArrowLeft className="w-4 h-4" />
            </Link>

            <div className="relative">
              <img
                src={
                  targetUser?.photoUrl ||
                  'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'
                }
                alt={targetUser?.firstName || 'Dev'}
                className="w-11 h-11 rounded-2xl object-cover border border-indigo-500/40 shadow"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full  border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {targetUser?.firstName} {targetUser?.lastName || ''}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full  text-emerald-400 border border-emerald-500/20">
                  <LuSparkles className="w-2.5 h-2.5" /> Connected
                </span>
              </div>
              {targetUser?.role && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                  <LuBriefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">
                    {targetUser.role}
                  </span>
                  {targetUser.experienceYears !== undefined &&
                    targetUser.experienceYears !== null && (
                      <span className="text-slate-500 font-mono text-[10px]">
                        • {targetUser.experienceYears}y exp
                      </span>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Target User Social Quick Links */}
          <div className="flex items-center gap-2">
            {targetUser?.githubUrl && (
              <a
                href={
                  targetUser.githubUrl.startsWith('http')
                    ? targetUser.githubUrl
                    : `https://${targetUser.githubUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all hover:scale-105"
                title="GitHub Profile"
              >
                <LuGithub className="w-4 h-4 text-slate-300" />
              </a>
            )}
            {effectiveLinkedIn && (
              <a
                href={
                  effectiveLinkedIn.startsWith('http')
                    ? effectiveLinkedIn
                    : `https://${effectiveLinkedIn}`
                }
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-blue-600/20 text-blue-400 hover:text-white border border-blue-500/30 transition-all hover:scale-105"
                title="LinkedIn Profile"
              >
                <LuLinkedin className="w-4 h-4 text-blue-400" />
              </a>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-950/40"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <LuSparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">
                You are connected!
              </h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Start a conversation with {targetUser?.firstName}. Discuss
                ideas, share repositories, and build something extraordinary
                together.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = String(msg.senderId) === String(user?._id);
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showDateDivider = isDifferentDay(
                msg.createdAt,
                prevMsg?.createdAt,
              );

              return (
                <div key={msg._id || index} className="space-y-3.5">
                  {showDateDivider && (
                    <div className="flex justify-center my-3 sticky top-1 z-10 select-none">
                      <div className="px-3.5 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/80 text-[11px] font-semibold tracking-wide shadow-md shadow-black/40 backdrop-blur-md">
                        {formatDateDivider(msg.createdAt)}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMine && (
                      <img
                        src={
                          targetUser?.photoUrl ||
                          'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'
                        }
                        alt={targetUser?.firstName || 'Dev'}
                        className="w-7 h-7 rounded-xl object-cover border border-slate-700 shrink-0 mb-1"
                      />
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-md text-sm leading-relaxed break-words ${
                        isMine
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                          : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div
                        className={`flex items-center gap-1 text-[10px] mt-1 font-mono ${
                          isMine
                            ? 'text-indigo-200 justify-end'
                            : 'text-slate-400 justify-start'
                        }`}
                      >
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMine && (
                          <LuCheckCheck className="w-3 h-3 text-indigo-200" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1">{targetUser?.firstName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Footer */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800/90 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder={`Message ${targetUser?.firstName || 'developer'}... (Press Enter to send)`}
            value={newMessage}
            onChange={handleInputChange}
            maxLength={1000}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LuSend className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
