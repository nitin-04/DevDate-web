import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useDispatch, useSelector } from 'react-redux';
import { addRequests, removeRequest } from '../utils/requestSlice';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';
import {
  LuUserCheck,
  LuCheck,
  LuX,
  LuSparkles,
  LuFlame,
  LuClock,
  LuTerminal,
} from 'react-icons/lu';

const SKILL_COLORS = [
  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
];

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users/requests/received');

      if (res.data && res.data.data) {
        dispatch(addRequests(res.data.data));
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const reviewRequest = async (status, _id) => {
    if (!_id) return;

    if (status === 'accepted') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#ec4899'],
      });
    }

    try {
      await apiClient.post(`/requests/review/${status}/${_id}`);
      dispatch(removeRequest(_id));
      if (status === 'accepted') {
        toast.success('Request accepted! Connected successfully.');
      } else {
        toast.info('Request declined.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update request';
      toast.error(msg);
      console.error('Error reviewing request:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider mb-1">
            <LuSparkles className="w-3.5 h-3.5" />
            <span>Collaboration Queue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Incoming Requests
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review developers who want to connect and build projects with you.
          </p>
        </div>

        {requests && requests.length > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold self-start sm:self-auto">
            <LuUserCheck className="w-4 h-4 text-indigo-400" />
            <span>{requests.length} Pending</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (!requests || requests.length === 0) && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 animate-pulse flex gap-5"
            >
              <div className="w-28 h-28 bg-slate-800 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800/60 rounded w-full" />
                <div className="h-8 bg-slate-800/40 rounded-xl w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && (!requests || requests.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
            <LuUserCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
          <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
            You have no pending requests right now. Keep your profile updated
            and discover other developers in your feed!
          </p>
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <LuFlame className="w-4 h-4 text-orange-300" />
            <span>Discover Feed</span>
          </Link>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        <AnimatePresence>
          {requests &&
            requests
              .filter((req) => req.fromUserId)
              .map((request) => {
                const {
                  _id,
                  firstName,
                  lastName,
                  age,
                  gender,
                  photoUrl,
                  about,
                  skills,
                } = request.fromUserId;

                return (
                  <motion.div
                    key={request._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      transition: { duration: 0.2 },
                    }}
                    className="rounded-3xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 shadow-xl shadow-black/30 overflow-hidden backdrop-blur-xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all"
                  >
                    {/* User Info */}
                    <div className="flex gap-4 sm:gap-5 items-start sm:items-center w-full sm:w-auto">
                      <div className="relative shrink-0">
                        <img
                          src={
                            photoUrl ||
                            'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'
                          }
                          alt={firstName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-700 shadow-md"
                          onError={(e) => {
                            e.target.src =
                              'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png';
                          }}
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900" />
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                            {firstName} {lastName || ''}
                          </h3>
                          {age && (
                            <span className="text-xs text-slate-400 font-mono">
                              {age}
                              {gender ? `, ${gender}` : ''}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                          {about ||
                            'Developer seeking connection and project collaboration.'}
                        </p>

                        {/* Skills */}
                        {skills && skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                                  SKILL_COLORS[idx % SKILL_COLORS.length]
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      <button
                        onClick={() => reviewRequest('rejected', request._id)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-all duration-200 cursor-pointer"
                        title="Decline request"
                      >
                        <LuX className="w-4 h-4" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => reviewRequest('accepted', request._id)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 text-xs font-semibold transition-all duration-200 cursor-pointer"
                        title="Accept request"
                      >
                        <LuCheck className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Requests;
