import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL } from '../utils/constants';
import { addfeed, removeUserFromFeed } from '../utils/feedSlice';
import UserCard from './UserCard';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Radar,
  RotateCcw,
  Sparkles,
  Flame,
  Check,
  X,
  Keyboard,
  Heart,
} from 'lucide-react';

// Card animation variants with explicit direction support
const cardVariants = {
  initial: { scale: 0.95, opacity: 0, y: 15 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: (direction) => ({
    x: direction === 'left' ? -600 : 600,
    opacity: 0,
    rotate: direction === 'left' ? -25 : 25,
    transition: { duration: 0.28, ease: 'easeInOut' },
  }),
};

// Individual Swipeable Card Wrapper
const SwipeableCard = ({ user, onSwipe, direction }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(
    x,
    [-200, -150, 0, 150, 200],
    [0.6, 1, 1, 1, 0.6],
  );

  // Stamp overlays
  const likeOpacity = useTransform(x, [40, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-40, -120], [0, 1]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe('interested', user._id, 'right');
    } else if (info.offset.x < -100) {
      onSwipe('ignored', user._id, 'left');
    }
  };

  return (
    <motion.div
      className="w-full cursor-grab active:cursor-grabbing select-none"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      variants={cardVariants}
      custom={direction}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="relative">
        {/* LIKE Stamp */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-6 left-6 z-30 pointer-events-none border-4 border-emerald-400 text-emerald-400 font-black text-2xl px-4 py-1 rounded-xl rotate-[-15deg] shadow-2xl bg-slate-950/90 tracking-wider flex items-center gap-1.5"
        >
          <Heart className="w-6 h-6 fill-emerald-400" />
          CONNECT
        </motion.div>

        {/* NOPE Stamp */}
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-6 right-6 z-30 pointer-events-none border-4 border-rose-500 text-rose-500 font-black text-2xl px-4 py-1 rounded-xl rotate-[15deg] shadow-2xl bg-slate-950/90 tracking-wider flex items-center gap-1.5"
        >
          <X className="w-6 h-6" />
          PASS
        </motion.div>

        <UserCard user={user} showActions={true} onAction={onSwipe} />
      </div>
    </motion.div>
  );
};

// Shimmering Skeleton Loader
const FeedSkeleton = () => (
  <div className="w-80 sm:w-96 h-[540px] rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 flex flex-col justify-between animate-pulse shadow-2xl">
    <div className="w-full h-72 bg-slate-800/80 rounded-2xl" />
    <div className="space-y-3 mt-4">
      <div className="h-7 bg-slate-800 rounded-lg w-2/3" />
      <div className="h-4 bg-slate-800/60 rounded-md w-full" />
      <div className="h-4 bg-slate-800/60 rounded-md w-4/5" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 bg-slate-800 rounded-full" />
        <div className="h-6 w-20 bg-slate-800 rounded-full" />
        <div className="h-6 w-14 bg-slate-800 rounded-full" />
      </div>
    </div>
    <div className="flex justify-center gap-6 pt-4 border-t border-slate-800/50">
      <div className="w-14 h-14 rounded-2xl bg-slate-800" />
      <div className="w-14 h-14 rounded-2xl bg-slate-800" />
    </div>
  </div>
);

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState('right');

  const getFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL + '/feed', {
        withCredentials: true,
      });
      dispatch(addfeed(res?.data));
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getFeed();
  }, [user?._id, getFeed]);

  const handleSwipe = async (status, userId, explicitDir) => {
    if (!userId) return;
    const dir = explicitDir || (status === 'ignored' ? 'left' : 'right');
    setSwipeDirection(dir);

    if (status === 'interested') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#ec4899', '#10b981', '#38bdf8'],
      });
    }

    try {
      await axios.post(
        BASE_URL + '/request/send/' + status + '/' + userId,
        {},
        { withCredentials: true },
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error('Error handling swipe:', err);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!feed || feed.length === 0) return;
      const topUser = feed[0];

      if (e.key === 'ArrowLeft') {
        handleSwipe('ignored', topUser._id, 'left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('interested', topUser._id, 'right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feed]);

  if (loading && !feed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <FeedSkeleton />
      </div>
    );
  }

  // Radar Scanner Empty State
  if (!feed || feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          {/* Concentric radar rings */}
          <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping opacity-75" />
          <div className="absolute inset-4 rounded-full border border-indigo-500/30" />
          <div className="absolute inset-10 rounded-full border border-indigo-500/40" />
          <div className="absolute inset-16 rounded-full border border-indigo-500/50 bg-indigo-500/5" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 z-10">
            <Radar
              className="w-8 h-8 text-white animate-spin"
              style={{ animationDuration: '4s' }}
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Radar Scanning Complete
        </h2>
        <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
          You have reviewed all available developers in your network queue.
          Check back soon for new profiles or refresh to rescan.
        </p>

        <button
          onClick={getFeed}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Refresh Network Feed</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] py-6 px-4">
      {/* Top Banner Hint */}
      <div className="mb-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 backdrop-blur-md shadow-md">
        {/* <Flame className="w-3.5 h-3.5 text-orange-400" /> */}
        <span>
          Drag cards left to <strong className="text-rose-400">Pass</strong> or
          right to <strong className="text-emerald-400">Connect</strong>
        </span>
      </div>

      {/* Card Container */}
      <div className="relative w-80 sm:w-96 min-h-[540px] flex justify-center">
        <AnimatePresence custom={swipeDirection} mode="popLayout">
          {feed.length > 0 && (
            <SwipeableCard
              key={feed[0]._id}
              user={feed[0]}
              direction={swipeDirection}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Hotkey Help */}
      <div className="mt-6 flex items-center gap-4 text-xs text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            ←
          </kbd>{' '}
          Pass
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            →
          </kbd>{' '}
          Connect
        </span>
      </div>
    </div>
  );
};

export default Feed;
