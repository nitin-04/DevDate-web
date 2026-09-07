import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { clearFeed } from "../utils/feedSlice";
import { removeConnections } from "../utils/connectionSlice";
import { clearRequests } from "../utils/requestSlice";
import { 
  LuCodeXml, 
  LuFlame, 
  LuUsers, 
  LuUserCheck, 
  LuUser as UserIcon, 
  LuLogOut, 
  LuSparkles, 
  LuChevronDown 
} from "react-icons/lu";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      dispatch(clearFeed());
      dispatch(removeConnections());
      dispatch(clearRequests());
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navLinks = [
    { to: "/", label: "Feed", icon: LuFlame },
    { to: "/connections", label: "Connections", icon: LuUsers },
    { 
      to: "/requests", 
      label: "Requests", 
      icon: LuUserCheck, 
      badge: requests && requests.length > 0 ? requests.length : null 
    },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/80 text-slate-100 shadow-lg shadow-black/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={(e) => !user && e.preventDefault()}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <LuCodeXml className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Dev<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Date</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <LuSparkles className="w-2.5 h-2.5" /> v1.0
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Desktop) */}
        {user && (
          <div className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-full border border-slate-800/80 shadow-inner">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-pink-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* User Profile & Dropdown */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <div className="relative">
                  <img
                    src={user.photoUrl || "https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png"}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <span className="text-sm font-semibold text-slate-200 max-w-[100px] truncate">
                  {user.firstName}
                </span>
                <LuChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 transform origin-top-right">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                  <p className="text-sm font-bold text-slate-100 truncate">{user.firstName} {user.lastName}</p>
                </div>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      <span>Edit Profile</span>
                    </Link>
                  </li>
                  <li className="md:hidden">
                    <Link
                      to="/"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <LuFlame className="w-4 h-4 text-orange-400" />
                      <span>Feed</span>
                    </Link>
                  </li>
                  <li className="md:hidden">
                    <Link
                      to="/connections"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <LuUsers className="w-4 h-4 text-blue-400" />
                      <span>Connections</span>
                    </Link>
                  </li>
                  <li className="md:hidden">
                    <Link
                      to="/requests"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <LuUserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Requests</span>
                      </div>
                      {requests && requests.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500 text-white font-bold">
                          {requests.length}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li className="border-t border-slate-800/80 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LuLogOut className="w-4 h-4 text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
