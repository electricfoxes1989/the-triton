import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu, Search, X, ChevronRight } from "lucide-react";

const navItems = [
  { label: "News", href: "/news" },
  { label: "Crew Life", href: "/crew-life" },
  { label: "Magazines", href: "/magazines" },
  { label: "Events", href: "/events" },
  { label: "Destinations", href: "/destinations" },
  { label: "Yachts For Sale", href: "/yachts-for-sale" },
];

const utilityLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Media Kit", href: "/media-kit" },
  { label: "Subscribe", href: "/newsletter" },
  { label: "Contribute", href: "/contributors" },
];

export default function Navigation() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-white"
        }`}
      >
        {/* Top utility bar — hidden on mobile */}
        <div className="hidden md:block border-b border-gray-100">
          <div className="container">
            <div className="flex items-center justify-between h-8 text-[11px] tracking-wide uppercase">
              <div className="flex items-center gap-6 text-gray-400 font-medium">
                <Link href="/about" className="hover:text-gray-700 transition-colors">About</Link>
                <Link href="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
                <Link href="/media-kit" className="hover:text-gray-700 transition-colors">Media Kit</Link>
              </div>
              <div className="flex items-center gap-6 text-gray-400 font-medium">
                <Link href="/newsletter" className="hover:text-gray-700 transition-colors">Subscribe</Link>
                <Link href="/contributors" className="hover:text-gray-700 transition-colors">Contribute</Link>
                {isAuthenticated && user?.role === "admin" && (
                  <Link href="/admin" className="hover:text-gray-700 transition-colors">Admin</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="container">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Hamburger — mobile only */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className="p-2 -ml-2 text-[#0A1628] hover:bg-gray-50 rounded-lg transition-colors"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[340px] bg-white p-0 border-r border-gray-100">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">Main site navigation and search</SheetDescription>
                  <div className="flex flex-col h-full">
                    {/* Mobile menu header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                      <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                        <img
                          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663323529567/PczUaLAcshdsvrhM.png"
                          alt="The Triton"
                          className="h-8 w-auto"
                        />
                      </Link>
                    </div>

                    {/* Mobile search */}
                    <div className="px-5 py-4 border-b border-gray-100">
                      <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="search"
                          placeholder="Search articles..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 text-sm bg-transparent border-0 outline-none placeholder-gray-400 text-[#0A1628]"
                        />
                      </form>
                    </div>

                    {/* Main nav items */}
                    <nav className="flex-1 overflow-y-auto py-2">
                      {navItems.map((item) => {
                        const isActive = location.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-5 py-3.5 text-[15px] font-medium transition-colors ${
                              isActive
                                ? "text-[#0A1628] bg-gray-50"
                                : "text-gray-600 hover:text-[#0A1628] hover:bg-gray-50"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span>{item.label}</span>
                            <ChevronRight className={`h-4 w-4 ${isActive ? "text-[#3ECFB2]" : "text-gray-300"}`} />
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Utility links in mobile drawer */}
                    <div className="border-t border-gray-100 px-5 py-5 space-y-3">
                      {utilityLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block text-sm text-gray-500 hover:text-[#0A1628] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      {isAuthenticated && user?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="block text-sm text-gray-500 hover:text-[#0A1628] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo — centered on mobile, left on desktop */}
            <Link href="/" className="flex-shrink-0 lg:flex-shrink lg:mr-8">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663323529567/PczUaLAcshdsvrhM.png"
                alt="The Triton"
                className="h-8 sm:h-9 md:h-12 w-auto"
              />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors rounded-sm ${
                    location.startsWith(item.href)
                      ? "text-[#0A1628]"
                      : "text-gray-500 hover:text-[#0A1628]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-[#0A1628] transition-colors rounded-full hover:bg-gray-50"
                aria-label={searchOpen ? "Close search" : "Search"}
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search overlay — full width, clean */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white">
            <div className="container py-3 sm:py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-2xl mx-auto">
                <Search className="h-5 w-5 text-gray-400 flex-shrink-0 hidden sm:block" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-base sm:text-lg bg-transparent border-0 outline-none placeholder-gray-300 text-[#0A1628]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-500 hover:text-[#0A1628] transition-colors px-3 py-1.5"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
