import { useState, useRef } from 'react';
import UserCard from './UserCard';
import PropTypes, { number } from 'prop-types';
import apiClient from '../api/apiClient';
import { addUser } from '../utils/userSlice';
import { useDispatch } from 'react-redux';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';
import {
  LuUser,
  LuSparkles,
  LuTerminal,
  LuImage,
  LuFileText,
  LuSave,
  LuCheck,
  LuPlus,
  LuX,
  LuEye,
  LuCloudUpload,
  LuLink2,
  LuTrash2,
  LuCamera,
  LuUpload,
} from 'react-icons/lu';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'Rust',
  'Go',
  'Next.js',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'AWS',
  'TailwindCSS',
  'GraphQL',
  'Kubernetes',
];

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [age, setAge] = useState(user.age || '');
  const [gender, setGender] = useState(user.gender || 'Other');
  const [githubUrl, setgithubUrl] = useState(user.githubUrl || '');
  const [linkedInUrl, setLinkedInUrl] = useState(user.linkedInUrl || '');
  const [role, setRole] = useState(
    Array.isArray(user.role)
      ? user.role.join(', ')
      : typeof user.role === 'string'
        ? user.role
        : '',
  );
  const [experienceYears, setExperienceYears] = useState(
    user.experienceYears !== undefined && user.experienceYears !== null
      ? user.experienceYears
      : '',
  );
  const [about, setAbout] = useState(user.about || '');
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [skills, setSkills] = useState(
    user.skills || ['React', 'Node.js', 'JavaScript'],
  );
  const [customSkill, setCustomSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please drop a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size should be less than 5MB.');
      return;
    }
    setFileName(file.name);
    setSelectedFile(file);
    // Instant browser preview via object URL (zero Base64 memory overhead)
    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);
    toast.info('Image preview ready. Click Save Changes to apply.');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearPhoto = () => {
    setPhotoUrl('');
    setFileName('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleSkill = (skillName) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter((s) => s !== skillName));
    } else {
      if (skills.length < 10) {
        setSkills([...skills, skillName]);
      }
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills([...skills, trimmed]);
      setCustomSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const saveProfile = async () => {
    setSaving(true);

    try {
      let finalPhotoUrl = photoUrl;

      // If a new local image was selected, upload it to Cloudinary via backend multipart endpoint
      if (selectedFile) {
        const formData = new FormData();
        formData.append('photo', selectedFile);

        const uploadRes = await apiClient.post(
          '/profile/upload-photo',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (uploadRes?.data?.photoUrl) {
          finalPhotoUrl = uploadRes.data.photoUrl;
          setPhotoUrl(finalPhotoUrl);
          setSelectedFile(null);
        }
      }

      const payload = {
        firstName,
        lastName,
        age: age === '' ? undefined : Number(age),
        gender,
        photoUrl: finalPhotoUrl,
        about,
        skills,
        role,
        experienceYears:
          experienceYears === '' ? undefined : Number(experienceYears),
        githubUrl,
        linkedInUrl,
      };

      const res = await apiClient.patch('/profile/edit', payload);

      dispatch(addUser(res?.data?.data));

      // Trigger Celebration Confetti
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f43f5e', '#38bdf8'],
      });

      toast.success('Profile successfully updated!');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string'
          ? err.response.data
          : 'Failed to update profile.');
      toast.error(msg);
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider mb-1">
            <LuSparkles className="w-3.5 h-3.5" />
            <span>Developer Profile</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Edit Your Identity
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Fine-tune how you appear to other developers swiping in the feed.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
            <LuUser className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">
              General Information
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  First Name
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {firstName.length}/25
                </span>
              </div>
              <input
                type="text"
                maxLength={25}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.slice(0, 25))}
                placeholder="e.g. Alex"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Last Name
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {lastName.length}/25
                </span>
              </div>
              <input
                type="text"
                maxLength={25}
                value={lastName}
                onChange={(e) => setLastName(e.target.value.slice(0, 25))}
                placeholder="e.g. Chen"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || val.length <= 2) {
                    setAge(val);
                  }
                }}
                placeholder="e.g. 24"
                min="18"
                max="99"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Experience Years
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || val.length <= 2) {
                    setExperienceYears(val);
                  }
                }}
                placeholder="e.g. 5"
                min="0"
                max="99"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Role
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {role.length}/40
                </span>
              </div>
              <input
                type="text"
                maxLength={40}
                value={role}
                onChange={(e) => setRole(e.target.value.slice(0, 40))}
                placeholder="e.g. FrontEnd Developer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                GItHub URL
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setgithubUrl(e.target.value)}
                placeholder="e.g. https://github.com/alex"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="e.g. https://www.linkedin.com/alex"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Avatar Photo: Drag & Drop + URL Tabs */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <LuCamera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Avatar / Profile Photo</span>
              </label>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    photoMode === 'upload'
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LuCloudUpload className="w-3 h-3" />
                  <span>Drag & Drop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    photoMode === 'url'
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LuLink2 className="w-3 h-3" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            {photoMode === 'upload' ? (
              /* Drag & Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950/90'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {photoUrl ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-lg">
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                        {fileName || 'Photo Selected'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Drag & drop a new photo to replace
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearPhoto();
                      }}
                      className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                    >
                      <LuTrash2 className="w-3 h-3" />
                      <span>Remove Photo</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1">
                      <LuCloudUpload className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-200">
                      Drag & Drop your photo here, or{' '}
                      <span className="text-indigo-400 underline underline-offset-2">
                        browse files
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WEBP, GIF, SVG (up to 10MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Image URL Input */
              <div className="space-y-1.5">
                <div className="relative">
                  <LuLink2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Paste a direct link to an image on the web.
                </p>
              </div>
            )}
          </div>

          {/* About / Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <LuFileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>About Bio</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {about.length}/200
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              value={about}
              onChange={(e) => setAbout(e.target.value.slice(0, 200))}
              placeholder="What are you building? What kind of collaborator are you looking for?"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all leading-relaxed"
            />
          </div>

          {/* Tech Stack Skills Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <LuTerminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tech Stack (Select up to 10)</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {skills.length}/10
              </span>
            </div>

            {/* Popular Skills Chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25 border border-indigo-400/40 scale-105'
                        : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                  </button>
                );
              })}
            </div>

            {/* Selected Skills Pills */}
            {skills.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                <p className="text-[11px] text-slate-400 mb-2 font-mono uppercase">
                  Current Stack:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="hover:text-rose-400 cursor-pointer"
                      >
                        <LuX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Skill */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom skill (e.g. Solidity, Flutter)..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill(e)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LuPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {saving ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <LuSave className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-24">
          <div className="mb-3 flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <LuEye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Live Feed Preview</span>
          </div>

          <UserCard
            user={{
              firstName: firstName || 'Your',
              lastName: lastName || 'Name',
              age: age || 25,
              role: role,
              gender: gender || 'Other',
              experienceYears: experienceYears,
              photoUrl:
                photoUrl ||
                'https://thehotelexperience.com/wp-content/uploads/2019/08/default-avatar.png',
              about:
                about ||
                'Your bio will be displayed here for other developers to read.',
              skills: skills.length > 0 ? skills : ['JavaScript', 'React'],
              githubUrl: githubUrl,
              linkedInUrl: linkedInUrl,
            }}
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
};

EditProfile.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gender: PropTypes.string,
    role: PropTypes.string,
    experienceYears: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    linkedInUrl: PropTypes.string,
    githubUrl: PropTypes.string,
    photoUrl: PropTypes.string,
    about: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default EditProfile;
