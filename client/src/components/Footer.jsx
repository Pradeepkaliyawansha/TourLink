import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  ArrowUp,
} from "lucide-react";
import { useState, useEffect } from "react";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    company: [
      { name: "About Us", href: "#" },
      { name: "Our Team", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Safety", href: "#" },
      { name: "Cancellation", href: "#" },
      { name: "Contact Us", href: "./../pages/ContactUs.jsx" },
    ],
    discover: [
      { name: "Trust & Safety", href: "#" },
      { name: "Travel Credits", href: "#" },
      { name: "Gift Cards", href: "#" },
      { name: "Sitemap", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Decorative Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-12 sm:h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white dark:fill-gray-800"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 group">
              <MapPin className="h-8 w-8 text-primary-600 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                TourHub
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">
              Discover amazing destinations and create unforgettable memories
              with expert tour guides from around the world.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              <a
                href="mailto:info@tourhub.com"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
              >
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm">info@tourhub.com</span>
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
              >
                <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm">+1 (234) 567-890</span>
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white relative inline-block">
              Company
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-600 dark:bg-primary-400"></span>
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li
                  key={index}
                  className="transform hover:translate-x-1 transition-transform duration-200"
                >
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white relative inline-block">
              Support
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-600 dark:bg-primary-400"></span>
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li
                  key={index}
                  className="transform hover:translate-x-1 transition-transform duration-200"
                >
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white relative inline-block">
              Discover
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-600 dark:bg-primary-400"></span>
            </h3>
            <ul className="space-y-2">
              {footerLinks.discover.map((link, index) => (
                <li
                  key={index}
                  className="transform hover:translate-x-1 transition-transform duration-200"
                >
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 md:p-8 mb-12 border border-primary-200 dark:border-gray-700 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get the latest travel tips and exclusive offers delivered to
                your inbox
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all min-w-[250px]"
              />
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Links & Bottom Bar */}
        <div className="border-t border-gray-300 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Icons */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="group relative"
                >
                  <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                    <social.icon className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  </div>
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-end gap-2">
                Made with
                <Heart
                  className="h-4 w-4 text-red-500 animate-pulse"
                  fill="currentColor"
                />
                © {new Date().getFullYear()} TourHub. All rights reserved.
              </p>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            <a
              href="#"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Terms of Service
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Cookie Policy
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
