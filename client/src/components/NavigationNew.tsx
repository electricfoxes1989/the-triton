import { useState } from "react";
import { Link } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { SearchModal } from "./SearchModal";
import BannerAd from "./BannerAd";

export default function NavigationNew() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);



  return (
    <div className="sticky top-0 z-50 bg-white">
      {/* Top Bar with Subscribe and Advertise links */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex justify-end items-center h-10 text-xs uppercase tracking-wide">
            <Link href="/newsletter" className="text-gray-700 hover-aqua px-4">
              Subscribe to our Newsletter
            </Link>
            <Link href="/advertise" className="text-gray-700 hover-aqua px-4 border-l border-gray-300">
              Advertise with us
            </Link>
          </div>
        </div>
      </div>

      {/* Logo and Ad Banner Row */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Triton Logo */}
            <Link href="/" className="flex-shrink-0">
              <img 
                src="/triton-logo.png" 
                alt="Triton News" 
                className="h-19 w-auto"
                style={{ height: '76px' }}
              />
            </Link>
            
            {/* Ad Banner Space */}
            <div className="flex-1 h-24 flex items-center justify-center">
              <BannerAd 
                page="all" 
                position="nav-top"
                className="h-full w-auto"
                fallbackContent={
                  <img 
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663300921591/WOOPvtNVghHvPkWb.png" 
                    alt="Quantum Marine Stabilizers"
                    className="h-full w-auto object-contain"
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-primary text-white shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Empty space for alignment */}
            <div className="w-8"></div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-wider font-medium">
              <Link href="/news" className="hover-aqua">
                News
              </Link>
              <Link href="/captains" className="hover-aqua">
                Captains
              </Link>
              <Link href="/crew-life" className="hover-aqua">
                Crew Life
              </Link>
              <Link href="/magazine" className="hover-aqua">
                Magazine
              </Link>
              <Link href="/events" className="hover-aqua">
                Events
              </Link>
            </div>

            {/* Search Icon */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 hover:bg-primary/80 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-primary/80 rounded transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>


        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-primary">
            <div className="container mx-auto py-4 space-y-2">
              <Link
                href="/news"
                className="block px-4 py-2 hover:bg-white/10 rounded transition-colors uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link
                href="/captains"
                className="block px-4 py-2 hover:bg-white/10 rounded transition-colors uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Captains
              </Link>
              <Link
                href="/crew-life"
                className="block px-4 py-2 hover:bg-white/10 rounded transition-colors uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Crew Life
              </Link>
              <Link
                href="/magazine"
                className="block px-4 py-2 hover:bg-white/10 rounded transition-colors uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Magazine
              </Link>
              <Link
                href="/events"
                className="block px-4 py-2 hover:bg-white/10 rounded transition-colors uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}
