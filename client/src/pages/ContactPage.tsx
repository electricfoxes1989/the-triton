import { Link } from "wouter";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { Mail, MapPin, FileText } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationNew />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-6 md:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#00BCD4]">Home</Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">Contact</span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-6 md:px-8 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-[#0A2342] border-b-2 border-[#0A2342] pb-3 inline-block">
            Contact
          </h1>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 md:px-8 py-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-[#0A2342] mb-8">
              Get in Touch
              <div className="h-1 w-20 bg-[#00BCD4] mt-2"></div>
            </h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#00BCD4] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#0A2342] mb-1">Editorial</h3>
                  <a href="mailto:info@the-triton.com" className="text-[#00BCD4] hover:underline">
                    info@the-triton.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#00BCD4] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#0A2342] mb-1">Advertising</h3>
                  <a href="mailto:advertise@the-triton.com" className="text-[#00BCD4] hover:underline">
                    advertise@the-triton.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#00BCD4] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#0A2342] mb-1">Location</h3>
                  <p className="text-gray-600">Based in Fort Lauderdale, Florida</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FileText className="w-5 h-5 text-[#00BCD4] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#0A2342] mb-1">Media Kit</h3>
                  <a href="/TRITON-MediaKit-2026.pdf" className="text-[#00BCD4] hover:underline" target="_blank" rel="noopener noreferrer">
                    Download 2026 Media Kit (PDF)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-16 pt-12 border-t border-gray-200 max-w-2xl">
            <h2 className="text-2xl font-bold text-[#0A2342] mb-4">
              Newsletter
              <div className="h-1 w-20 bg-[#00BCD4] mt-2"></div>
            </h2>
            <p className="text-gray-600 mb-6">
              Stay up to date with the latest from the superyacht industry. Subscribe to The Triton's newsletter for weekly updates delivered to your inbox.
            </p>
            <Link href="/newsletter" className="inline-block px-8 py-3 bg-[#0A2342] text-white font-semibold uppercase tracking-wide text-sm hover:bg-[#00BCD4] transition-colors">
              Subscribe to Newsletter
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
