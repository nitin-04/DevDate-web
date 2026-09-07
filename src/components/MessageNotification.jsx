import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../api/apiClient";
import { createSocketConnection } from "../utils/socket";
import { LuMessageCircle, LuX, LuSparkles } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

const MessageNotification = () => {
  const user = useSelector((store) => store.user);
  const location = useLocation();
  const navigate = useNavigate();

  const [activeToast, setActiveToast] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const currentPathRef = useRef(location.pathname);

  // Fetch unread count from database on login
  const fetchUnreadCount = async () => {
    if (!user?._id) return;
    try {
      const res = await apiClient.get('/chat/unread');
      const { totalUnread, unreadSenders } = res.data;
      setUnreadCount(totalUnread || 0);

      // If there are unread messages and user is not currently in chat, display prompt toast
      if (
        unreadSenders &&
        unreadSenders.length > 0 &&
        !currentPathRef.current.startsWith("/chat/")
      ) {
        const latest = unreadSenders[0];
        setActiveToast({
          senderId: latest.senderId,
          senderName: latest.senderName,
          senderPhoto: latest.senderPhoto,
          text:
            latest.count > 1
              ? `${latest.count} unread messages. Latest: "${latest.latestText}"`
              : latest.latestText,
        });

        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setActiveToast(null);
        }, 8000);
      }
    } catch (err) {
      console.error("Error fetching unread chat count:", err);
    }
  };

  // Keep currentPathRef synced and update read status
  useEffect(() => {
    currentPathRef.current = location.pathname;
    if (location.pathname.startsWith("/chat/")) {
      const targetUserId = location.pathname.split("/chat/")[1];
      if (targetUserId) {
        apiClient
          .post(`/chat/${targetUserId}/read`)
          .then(() => {
            // Re-fetch remaining unread count
            apiClient
              .get('/chat/unread')
              .then((res) => setUnreadCount(res.data.totalUnread || 0))
              .catch(() => {});
          })
          .catch(() => {});
      }
      setActiveToast(null);
    }
  }, [location.pathname]);

  // Fetch unread on initial load / login
  useEffect(() => {
    fetchUnreadCount();
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    const handleRegister = () => {
      console.log("🔔 [NotificationSocket] Registering user:", user._id);
      socket.emit("registerUser", String(user._id));
    };

    // Register on connect or immediately if already connected
    socket.on("connect", handleRegister);
    if (socket.connected) {
      handleRegister();
    }

    // Listen for incoming message notifications
    const handleNotification = (notification) => {
      console.log("🔔 [NotificationSocket] Received notification:", notification);

      // Don't show toast if user is already looking at that active chat
      const currentChatPath = `/chat/${notification.senderId}`;
      if (currentPathRef.current === currentChatPath) {
        return;
      }

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast
      setActiveToast(notification);

      // Auto-hide toast after 7 seconds
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 7000);
    };

    socket.on("messageNotification", handleNotification);

    return () => {
      clearTimeout(toastTimeoutRef.current);
      socket.off("connect", handleRegister);
      socket.off("messageNotification", handleNotification);
    };
  }, [user?._id]);

  if (!user?._id) return null;

  const handleOpenChat = (senderId) => {
    setActiveToast(null);
    setUnreadCount(0);
    navigate(`/chat/${senderId}`);
  };

  const handleDismissToast = (e) => {
    e.stopPropagation();
    setActiveToast(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* 1. Floating Slide-in Notification Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleOpenChat(activeToast.senderId)}
            className="pointer-events-auto w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-indigo-500/40 p-4 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl cursor-pointer hover:border-indigo-400/70 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              {/* Sender Avatar */}
              <div className="relative shrink-0">
                <img
                  src={
                    activeToast.senderPhoto ||
                    "https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png"
                  }
                  alt={activeToast.senderName}
                  className="w-10 h-10 rounded-xl object-cover border border-indigo-500/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {activeToast.senderName}
                    </p>
                    <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-0.5">
                      <LuSparkles className="w-2.5 h-2.5" /> new
                    </span>
                  </div>
                  <button
                    onClick={handleDismissToast}
                    className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Dismiss"
                  >
                    <LuX className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {activeToast.text}
                </p>

                <p className="text-[10px] text-indigo-400 font-semibold mt-2 group-hover:underline underline-offset-2">
                  Click to reply →
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Message Action Icon with Unread Counter */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (activeToast) {
            handleOpenChat(activeToast.senderId);
          } else {
            navigate("/connections");
          }
        }}
        className="pointer-events-auto relative w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center transition-all cursor-pointer border border-white/20"
        title="Messages & Connections"
      >
        <LuMessageCircle className="w-6 h-6" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-pink-500 px-1 text-[11px] font-black text-white shadow-lg shadow-pink-500/40 border-2 border-slate-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default MessageNotification;
