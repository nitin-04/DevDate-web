import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useDispatch, useSelector } from 'react-redux';
import { addConnections } from '../utils/connectionSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuUsers,
  LuSearch,
  LuMail,
  LuSparkles,
  LuCheck,
  LuFlame,
  LuCopy,
  LuMessageSquare,
  LuGithub,
  LuLinkedin,
} from 'react-icons/lu';

const SKILL_COLORS = [
  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'bg-amber-500/15 text-amber-400 border-amber-500/30',
];

const Connections = () => {
  const connections = useSelector((store) => store.connections || []);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/users/connections');
        dispatch(addConnections(res?.data?.data || []));
      } catch (err) {
        toast.error('Failed to load connections.');
        console.error('Error fetching connections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [dispatch]);

  const handleCopy = (emailId, id) => {
    if (emailId) {
      navigator.clipboard.writeText(emailId);
      toast.success('Email copied to clipboard!');
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredConnections = connections.filter((conn) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = `${conn.firstName} ${conn.lastName || ''}`
      .toLowerCase()
      .includes(term);
    const skillMatch = conn.skills?.some((s) => s.toLowerCase().includes(term));
    const aboutMatch = conn.about?.toLowerCase().includes(term);
    return nameMatch || skillMatch || aboutMatch;
  });

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider mb-1">
            <LuSparkles className="w-3.5 h-3.5" />
            <span>Developer Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            My Connections
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            You have{' '}
            <strong className="text-indigo-400">{connections.length}</strong>{' '}
            mutual developer match{connections.length === 1 ? '' : 'es'}.
          </p>
        </div>

        {/* Search Bar */}
        {connections.length > 0 && (
          <div className="relative w-full md:w-80">
            <LuSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, skill (e.g. React)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
            />
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && connections.length === 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 animate-pulse space-y-4"
            >
              <div className="w-full h-48 bg-slate-800 rounded-2xl" />
              <div className="h-6 bg-slate-800 rounded w-2/3" />
              <div className="h-4 bg-slate-800/60 rounded w-full" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 bg-slate-800 rounded-full" />
                <div className="h-6 w-16 bg-slate-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && connections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10">
            <LuUsers className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            No Connections Yet
          </h2>
          <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
            Start swiping right on developer profiles in your feed. When both of
            you connect, they will appear here!
          </p>
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <LuFlame className="w-4 h-4 text-orange-300" />
            <span>Discover Developers</span>
          </Link>
        </div>
      )}

      {/* No Search Results */}
      {!loading &&
        connections.length > 0 &&
        filteredConnections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 text-base">
              No matches found for &quot;
              <span className="text-white font-medium">{searchTerm}</span>&quot;
            </p>
          </div>
        )}

      {/* Connections Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnections.map((connection) => {
          const {
            _id,
            firstName,
            lastName,
            photoUrl,
            age,
            gender,
            about,
            skills,
            emailId,
            role,
            experienceYears,
            linkedInUrl,
            githubUrl,
          } = connection;
          const isCopied = copiedId === _id;
          const effectiveLinkedIn = linkedInUrl || connection.linkedinUrl;

          return (
            <div
              key={_id}
              className="group rounded-3xl bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/40 shadow-xl shadow-black/40 overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Photo with Ambient Background + Full Foreground */}
                <div className="relative w-full h-64 bg-slate-950 flex items-center justify-center overflow-hidden">
                  {/* Ambient Blur Backdrop */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-45 scale-125 pointer-events-none"
                    style={{
                      backgroundImage: `url(${photoUrl || 'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'})`,
                    }}
                  />

                  {/* 100% Full Uncropped Foreground Image */}
                  <img
                    src={
                      photoUrl ||
                      'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png'
                    }
                    alt={firstName}
                    className="relative z-10 w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 ease-out p-1"
                    onError={(e) => {
                      e.target.src =
                        'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent z-20 pointer-events-none" />

                  {/* Status indicator */}
                  <div className="absolute top-3 right-3 z-30">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Connected
                    </span>
                  </div>

                  {/* Name & Role overlay */}
                  <div className="absolute bottom-3 left-4 right-4 z-30 space-y-0.5">
                    <h3 className="text-xl font-black text-white drop-shadow-md flex items-baseline gap-2">
                      {firstName} {lastName || ''}
                      {age && (
                        <span className="text-sm font-normal text-slate-300 font-mono">
                          {age}
                        </span>
                      )}
                    </h3>
                    {(role || (experienceYears !== undefined && experienceYears !== null && experienceYears !== '')) && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 drop-shadow">
                        <Briefcase className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{role || 'Developer'}</span>
                        {experienceYears !== undefined && experienceYears !== null && experienceYears !== '' && (
                          <span className="text-slate-300 font-mono text-[10px] bg-slate-950/70 px-1.5 py-0.5 rounded border border-slate-700/50">
                            {experienceYears} {Number(experienceYears) === 1 ? 'yr' : 'yrs'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {about ||
                      'Full-stack developer open to collaborating and building awesome projects.'}
                  </p>

                  {/* Skills */}
                  {skills && skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className={`text-[11px] px-2 py-0.5 rounded-full border font-mono ${
                            SKILL_COLORS[idx % SKILL_COLORS.length]
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          +{skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/chat/${_id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  >
                    <LuMessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Now</span>
                  </Link>

                  {emailId && (
                    <a
                      href={`mailto:${emailId}`}
                      title="Send Email"
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all duration-200 hover:scale-105 flex items-center justify-center"
                    >
                      <LuMail className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() =>
                      handleCopy(
                        emailId ||
                          `${firstName.toLowerCase()}@devdate.internal`,
                        _id,
                      )
                    }
                    title="Copy Email"
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center"
                  >
                    {isCopied ? (
                      <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <LuCopy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Social Quick Links */}
                  {githubUrl && (
                    <a
                      href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-105"
                      title="GitHub Profile"
                    >
                      <LuGithub className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {effectiveLinkedIn && (
                    <a
                      href={effectiveLinkedIn.startsWith('http') ? effectiveLinkedIn : `https://${effectiveLinkedIn}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 text-blue-400 hover:text-white border border-blue-500/30 flex items-center justify-center transition-all duration-200 hover:scale-105"
                      title="LinkedIn Profile"
                    >
                      <LuLinkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Connections;
