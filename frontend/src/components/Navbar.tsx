import { Link, NavLink, useNavigate } from "react-router-dom";
import { Calendar, LayoutDashboard, LogOut, Menu, X, Sun, Moon, ChevronDown, User, Settings, ShieldAlert } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut();
    toast.success("Logged out successfully");
    navigate("/");
    setIsOpen(false);
    setProfileOpen(false);
  };

  const loggedOutLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const loggedInLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const navLinks = user ? loggedInLinks : loggedOutLinks;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
              <Calendar size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-neutral-900 dark:text-white">Planora</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                end={link.href === "/"}
                className={({ isActive }) =>
                  cn("text-sm font-medium transition-colors hover:text-orange-600", isActive ? "text-orange-600" : "text-neutral-600 dark:text-neutral-300")
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-all"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all"
                >
                  <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{user.displayName}</span>
                  <ChevronDown size={14} className={cn("text-neutral-400 transition-transform", profileOpen && "rotate-180")} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{user.role}</p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-all">
                        <LayoutDashboard size={16} /><span>Dashboard</span>
                      </Link>
                      <Link to="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-all">
                        <Settings size={16} /><span>Settings</span>
                      </Link>
                      {user.role === "admin" && (
                        <Link to="/dashboard/admin" onClick={() => setProfileOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-all">
                          <ShieldAlert size={16} /><span>Admin Panel</span>
                        </Link>
                      )}
                      <hr className="my-2 border-neutral-100 dark:border-neutral-700" />
                      <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full">
                        <LogOut size={16} /><span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-orange-600 transition-colors">Login</Link>
                <Link to="/signup" className="px-5 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-md shadow-orange-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-orange-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 space-y-1 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-all"
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-neutral-100 dark:border-neutral-800 my-2" />
          {user ? (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{user.role}</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">{user.displayName}</p>
              </div>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-orange-50">
                <LayoutDashboard size={18} /><span>Dashboard</span>
              </Link>
              <Link to="/dashboard/settings" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-orange-50">
                <Settings size={18} /><span>Settings</span>
              </Link>
              {user.role === "admin" && (
                <Link to="/dashboard/admin" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-purple-600 hover:bg-purple-50">
                  <ShieldAlert size={18} /><span>Admin Panel</span>
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 w-full">
                <LogOut size={18} /><span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-orange-50">Login</Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full py-3 bg-orange-600 text-white text-center font-bold rounded-xl shadow-lg shadow-orange-200">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
