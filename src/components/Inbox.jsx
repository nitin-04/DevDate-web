import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { createSocketConnection } from '../utils/socket';
import { setUnreadCount } from '../utils/unreadSlice';
import {
  LuMessageSquare,
  LuSearch,
  LuPlus,
  LuUsers,
  LuFlame,
  LuSparkles,
  LuCheckCheck,
  LuChevronRight,
  LuX,
} from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Inbox = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connectionSearch, setConnectionSearch] = useState('');

  const socketRef = useRef(null);

  // Fetch active conversations
  const fetchConversations = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await apiClient.get('/chat/conversations');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setConversations(res.data.data);
        // Calculate and update global unread count
        const total = res.data.data.reduce(
          (acc, conv) => acc + (conv.unreadCount || 0),
          0,
        );
        dispatch(setUnreadCount(total));
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id, dispatch]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time socket updates: bump updated conversation to top
  useEffect(() => {
    if (!user?._id) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    const handleRegister = () => {
      socket.emit('registerUser', String(user._id));
    };

    socket.on('connect', handleRegister);
    if (socket.connected) {
      handleRegister();
    }

    const handleNewMessage = (notification) => {
      // Re-fetch conversations or update in-memory
      fetchConversations();
    };

    socket.on('messageNotification', handleNewMessage);

    return () => {
      socket.off('connect', handleRegister);
      socket.off('messageNotification', handleNewMessage);
    };
  }, [user?._id, fetchConversations]);

  // Fetch connections for New Chat modal
  const handleOpenNewChat = async () => {
    setShowNewChatModal(true);
    setLoadingConnections(true);
    try {
      const res = await apiClient.get('/users/connections');
      setConnections(res?.data?.data || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const fullName =
      `${conv.targetUser?.firstName || ''} ${conv.targetUser?.lastName || ''}`.toLowerCase();
    const role = (conv.targetUser?.role || '').toLowerCase();
    const lastText = (conv.lastMessage?.text || '').toLowerCase();
    return (
      fullName.includes(term) || role.includes(term) || lastText.includes(term)
    );
  });

  // Filter connections in modal
  const filteredConnections = connections.filter((conn) => {
    if (!connectionSearch.trim()) return true;
    const term = connectionSearch.toLowerCase();
    const fullName =
      `${conn.firstName || ''} ${conn.lastName || ''}`.toLowerCase();
    const role = (conn.role || '').toLowerCase();
    return fullName.includes(term) || role.includes(term);
  });

  const totalUnread = conversations.reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header Card */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <LuMessageSquare className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Messages Inbox
              </h1>
              {totalUnread > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500 text-white shadow-lg shadow-pink-500/30 animate-pulse">
                  {totalUnread} new
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Real-time direct conversations with your developer connections
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNewChat}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <LuPlus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by developer name, role, or message..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm backdrop-blur-md"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LuX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-full h-20 rounded-2xl bg-slate-900/60 border border-slate-800/60 animate-pulse flex items-center px-4 gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="w-1/3 h-4 rounded bg-slate-800" />
                <div className="w-2/3 h-3 rounded bg-slate-800/70" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredConversations.length > 0 ? (
        <div className="space-y-2.5">
          {filteredConversations.map((conv) => {
            const { targetUser, lastMessage, unreadCount, updatedAt } = conv;
            const hasUnread = unreadCount > 0;
            const isLastMessageFromMe = lastMessage?.senderId === user?._id;
            const timeDisplay = formatMessageTime(
              lastMessage?.createdAt || updatedAt,
            );

            return (
              <motion.div
                key={conv.chatId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/chat/${targetUser._id}`)}
                className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-xl ${
                  hasUnread
                    ? 'bg-slate-900/95 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Left Section: Avatar + Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        targetUser?.photoUrl ||
                        'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'
                      }
                      alt={targetUser?.firstName || 'Dev'}
                      className="w-13 h-13 rounded-2xl object-cover border border-slate-700/80 group-hover:border-indigo-500/50 transition-colors shadow"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full  border-2 border-slate-900" />
                  </div>

                  {/* Name, Role & Message snippet */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                        {targetUser?.firstName} {targetUser?.lastName}
                      </h2>
                      {targetUser?.role && (
                        <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700/60 truncate max-w-[140px]">
                          {targetUser.role}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm">
                      {isLastMessageFromMe && (
                        <span className="text-slate-400 font-medium">You:</span>
                      )}
                      <p
                        className={`truncate ${
                          hasUnread
                            ? 'font-semibold text-white'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        {lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section: Time, Unread Badge & Action */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`text-[11px] font-mono ${
                      hasUnread
                        ? 'text-indigo-400 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {timeDisplay}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasUnread && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1.5 text-[11px] font-black text-white shadow-md shadow-pink-500/40 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    <LuChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/80 mx-auto flex items-center justify-center mb-4 text-slate-400 shadow-inner">
            <LuMessageSquare className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchTerm ? 'No matching conversations' : 'No messages yet'}
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
            {searchTerm
              ? `No chats matched "${searchTerm}". Try searching for another name or keyword.`
              : 'Connect with developers on the feed and start real-time conversations to build great projects together!'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleOpenNewChat}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <LuPlus className="w-4 h-4" />
              <span>Start a New Chat</span>
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm border border-slate-700 transition-all"
            >
              <LuFlame className="w-4 h-4 text-orange-400" />
              <span>Explore Feed</span>
            </Link>
            <Link
              to="/connections"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm border border-slate-700 transition-all"
            >
              <LuUsers className="w-4 h-4 text-blue-400" />
              <span>View Connections</span>
            </Link>
          </div>
        </div>
      )}

      {/* Start New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <LuSparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">
                    Start a Conversation
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Search */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900">
                <div className="relative">
                  <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={connectionSearch}
                    onChange={(e) => setConnectionSearch(e.target.value)}
                    placeholder="Search connected developers..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  />
                </div>
              </div>

              {/* Modal Connections List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[50vh]">
                {loadingConnections ? (
                  <div className="text-center py-8 text-slate-400 text-sm animate-pulse">
                    Loading connections...
                  </div>
                ) : filteredConnections.length > 0 ? (
                  filteredConnections.map((conn) => (
                    <div
                      key={conn._id}
                      onClick={() => {
                        setShowNewChatModal(false);
                        navigate(`/chat/${conn._id}`);
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            conn.photoUrl ||
                            'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'
                          }
                          alt={conn.firstName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                            {conn.firstName} {conn.lastName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {conn.role || 'Developer'}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-indigo-400 px-3 py-1 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                        Message →
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 px-4 text-slate-400">
                    <LuUsers className="w-10 h-10 mx-auto mb-2 text-slate-500 opacity-60" />
                    <p className="text-sm font-semibold text-slate-300 mb-1">
                      {connectionSearch
                        ? 'No connections match search'
                        : 'No connections found'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                      You can only chat with developers after accepting each
                      other's connection requests.
                    </p>
                    <Link
                      to="/"
                      onClick={() => setShowNewChatModal(false)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                    >
                      Find developers on Feed
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inbox;
