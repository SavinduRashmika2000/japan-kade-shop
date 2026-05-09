import { Car, Globe, Share2, MessageCircle, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600 text-white">
                <Car className="w-6 h-6" />
              </div>
              <div className="text-xl font-bold text-white tracking-tight">Mind Spare Parts</div>
            </div>
            <p className="text-slate-400 leading-relaxed mb-8">
              Trusted automotive parts for every journey. Premium quality, genuine brands, and competitive prices.
            </p>
            <div className="flex gap-4">
              {[Globe, Share2, MessageCircle, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-slate-300" />
                </a>
              ))}
            </div>
          </div>


          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'About Us', 'Contact', 'Contact Us'].map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Part Categories</h4>
            <ul className="space-y-4">
              {['Engine Components', 'Braking System', 'Electrical Parts', 'Suspension', 'Filters & Plugs'].map(link => (
                <li key={link}>
                  <a href="#inventory" className="text-slate-400 hover:text-blue-400 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Opening Hours</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="text-white font-medium">8:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="text-white font-medium">9:00 AM - 4:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-blue-400 font-medium">Closed</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Mind Spare Parts. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-blue-400">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
