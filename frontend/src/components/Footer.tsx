import { Link } from "react-router-dom";
import { Calendar, Mail, Phone, MapPin, Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-900 dark:bg-black border-t border-neutral-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                <Calendar size={18} />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">Planora</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed">
              The premium platform for managing and discovering extraordinary events. Join our community today.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/events" className="text-neutral-400 hover:text-orange-500 text-sm transition-colors">Browse Events</Link></li>
              <li><Link to="/dashboard/my-events" className="text-neutral-400 hover:text-orange-500 text-sm transition-colors">Create Event</Link></li>
              <li><Link to="/signup" className="text-neutral-400 hover:text-orange-500 text-sm transition-colors">Join Community</Link></li>
              <li><Link to="/login" className="text-neutral-400 hover:text-orange-500 text-sm transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-neutral-400 hover:text-orange-500 text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-neutral-400 hover:text-orange-500 text-sm transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-neutral-400 hover:text-orange-500 text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-neutral-400 text-sm">
                <Mail size={15} className="text-orange-500 shrink-0" /><span>support@planora.app</span>
              </li>
              <li className="flex items-center space-x-3 text-neutral-400 text-sm">
                <Phone size={15} className="text-orange-500 shrink-0" /><span>+880 1234-567890</span>
              </li>
              <li className="flex items-center space-x-3 text-neutral-400 text-sm">
                <MapPin size={15} className="text-orange-500 shrink-0" /><span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-xs">&copy; {new Date().getFullYear()} Planora. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-neutral-500 hover:text-orange-500 transition-colors"><Github size={18} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-neutral-500 hover:text-orange-500 transition-colors"><Twitter size={18} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-neutral-500 hover:text-orange-500 transition-colors"><Instagram size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
