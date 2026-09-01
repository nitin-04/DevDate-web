import { Code2, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl text-slate-400 py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <p className="text-xs sm:text-sm">
            © {new Date().getFullYear()}{' '}
            <span className="font-bold text-slate-200">DevDate</span>. Built for
            developers worldwide.
          </p>
        </div>

        {/* Center Tech Stack Badge */}
        {/* <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            React 19
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            Redux Toolkit
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            Node.js / Express
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            MongoDB
          </span>
        </div> */}

        {/* Right Links */}
        <div className="flex items-center space-x-6 text-xs font-medium text-slate-400">
          <a href="#" className="hover:text-indigo-400 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-indigo-400 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-indigo-400 transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
