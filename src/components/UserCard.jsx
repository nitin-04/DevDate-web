import PropTypes from 'prop-types';
import { BASE_URL } from '../utils/constants';
import axios from 'axios';
import { removeUserFromFeed } from '../utils/feedSlice';
import { useDispatch } from 'react-redux';
import { X, Heart, Sparkles, Terminal, MapPin, Briefcase } from 'lucide-react';

const SKILL_COLORS = [
  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'bg-rose-500/15 text-rose-400 border-rose-500/30',
];

const UserCard = ({ user, showActions = true, onAction }) => {
  const dispatch = useDispatch();
  const { _id, firstName, lastName, age, gender, photoUrl, about, skills } =
    user;

  const handleSendRequest = async (status, userId) => {
    if (!userId) return;
    const dir = status === 'ignored' ? 'left' : 'right';
    if (onAction) {
      onAction(status, userId, dir);
      return;
    }
    try {
      await axios.post(
        BASE_URL + '/request/send/' + status + '/' + userId,
        {},
        { withCredentials: true },
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error('Error sending connection request:', err);
    }
  };

  return (
    <div className="w-80 sm:w-96 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden text-slate-100 flex flex-col transition-all duration-300">
      {/* Photo with Ambient Background + Full Foreground */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-950 flex items-center justify-center overflow-hidden group">
        {/* Ambient Blur Backdrop (Fills entire container with natural image colors) */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-45 scale-125 pointer-events-none"
          style={{
            backgroundImage: `url(${photoUrl || 'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'})`,
          }}
        />

        {/* 100% Full Uncropped Foreground Image */}
        <img
          className="relative z-10 w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
          src={
            photoUrl ||
            'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'
          }
          alt={`${firstName} ${lastName || ''}`}
          loading="eager"
          onError={(e) => {
            e.target.src =
              'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png';
          }}
        />

        {/* Subtle Bottom Gradient Scrim */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-emerald-400 border border-emerald-500/30 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
            Open to Collab
          </span>

          {gender && (
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-medium text-slate-300 border border-slate-700/60">
              {gender}
            </span>
          )}
        </div>

        {/* Name & Age Overlay at bottom of image */}
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg flex items-baseline gap-2">
            {firstName} {lastName || ''}
            {age && (
              <span className="text-lg font-normal text-slate-300 font-mono">
                {age}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* About Bio */}
        <div>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
            {about ||
              'Full-stack developer looking to build great software and connect with other engineers.'}
          </p>
        </div>

        {/* Skills Tech Stack */}
        {skills && skills.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-medium ${
                    SKILL_COLORS[index % SKILL_COLORS.length]
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        {showActions && _id && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-around gap-4">
              {/* Ignore / Pass Button */}
              <div className="flex flex-col items-center gap-1">
                <button
                  className="w-14 h-14 rounded-2xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 shadow-lg shadow-black/40 hover:shadow-rose-500/20 flex items-center justify-center transition-all duration-200 group active:scale-95 cursor-pointer"
                  onClick={() => handleSendRequest('ignored', _id)}
                  title="Pass (Left Arrow)"
                >
                  <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-[10px] text-slate-500 font-mono">
                  Pass (←)
                </span>
              </div>

              {/* Interested / Connect Button */}
              <div className="flex flex-col items-center gap-1">
                <button
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center transition-all duration-200 group active:scale-95 cursor-pointer border border-white/10"
                  onClick={() => handleSendRequest('interested', _id)}
                  title="Connect (Right Arrow)"
                >
                  <Heart className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-[10px] text-indigo-400 font-mono font-medium">
                  Connect (→)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gender: PropTypes.string,
    photoUrl: PropTypes.string,
    about: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  showActions: PropTypes.bool,
  onAction: PropTypes.func,
};

export default UserCard;
