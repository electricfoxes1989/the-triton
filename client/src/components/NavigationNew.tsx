import { useState } from "react";
import { Link } from "wouter";
import { Search, Menu, X } from "lucide-react";

export default function NavigationNew() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top Bar with Subscribe and Advertise links */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Triton Logo */}
            <Link href="/" className="flex-shrink-0">
              <img 
                src="/triton-logo.png" 
                alt="Triton News" 
                className="h-21 w-auto"
                style={{ height: '84px' }}
              />
            </Link>
            
            {/* Ad Banner Space */}
            <div className="flex-1 h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              Advertisement Space (728x90)
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-primary text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Empty space for alignment */}
            <div className="w-8"></div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-wider font-medium">
              <Link href="/category/news" className="hover-aqua">
                News
              </Link>
              <Link href="/category/captains" className="hover-aqua">
                Captains
              </Link>
              <Link href="/category/crew-life" className="hover-aqua">
                Crew Life
              </Link>
              <Link href="/category/magazine" className="hover-aqua">
                Magazine
              </Link>
              <Link href="/events" className="hover-aqua">
                Events
              </Link>
            </div>

            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
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

          {/* Search Bar */}
          {searchOpen && (
            <div className="border-t border-white/20 py-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="flex-1 px-4 py-2 rounded bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:border-white/40"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-primary rounded font-medium hover:bg-gray-100 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-primary">
            <div className="container mx-auto py-4 space-y-2">
              <Link
                href="/category/news"
                className="block px-4 py-2 hover:bg-white/10 rounded transition-colors uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link
                href="/category/captains"
                className="block px-4 py-2 hover:bg-white/10 rounded transition-colors uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Captains
              </Link>
              <Link
                href="/category/crew-life"
                className="block px-4 py-2 hover:bg-white/10 rounded transition-colors uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Crew Life
              </Link>
              <Link
                href="/category/magazine"
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
    </>
  );
}
