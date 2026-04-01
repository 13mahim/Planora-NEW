import { Link } from "react-router-dom";
import { Calendar, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                <Calendar size={18} />
              </div>
              <span className="text-xl font-bold tracking-tighter text-neutral-900">
                Planora
              </span>
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed">
              The premium platform for managing and discovering extraordinary events. 
              Join our community of organizers and participants today.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-6">
              Platform
            </h3>
            <ul className="space-y-4">
              <li><Link to="/events" className="text-neutral-500 hover:text-orange-600 text-sm transition-colors">Browse Events</Link></li>
              <li><Link to="/dashboard" className="text-neutral-500 hover:text-orange-600 text-sm transition-colors">Create Event</Link></li>
              <li><Link to="/signup" className="text-neutral-500 hover:text-orange-600 text-sm transition-colors">Join Community</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-6">
              Support
            </h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-neutral-500 hover:text-orange-600 text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-neutral-500 hover:text-orange-600 text-sm transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-neutral-500 hover:text-orange-600 text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-6">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-neutral-500 text-sm">
                <Mail size={16} className="text-orange-600" />
                <span>hello@planora.com</span>
              </li>
              <li className="flex items-center space-x-3 text-neutral-500 text-sm">
                <Phone size={16} className="text-orange-600" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 text-neutral-500 text-sm">
                <MapPin size={16} className="text-orange-600" />
                <span>123 Event St, San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-neutral-400 text-xs">
            &copy; {new Date().getFullYear()} Planora. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" aria-label="Instagram" className="text-neutral-400 hover:text-orange-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="text-neutral-400 hover:text-orange-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
            <a href="#" aria-label="Facebook" className="text-neutral-400 hover:text-orange-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
