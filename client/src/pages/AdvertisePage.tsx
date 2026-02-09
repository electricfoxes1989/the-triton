import { useState } from "react";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Mail, Users, TrendingUp, Globe } from "lucide-react";

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Thank you for your enquiry! We'll be in touch shortly.");
    setFormData({ name: "", email: "", company: "", phone: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationNew />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-[#00BCD4] py-20">
          <div className="container mx-auto px-6 md:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase" style={{ fontFamily: 'Georgia, serif' }}>
              Advertise With Triton
            </h1>
            <p className="text-white/90 text-xl max-w-3xl leading-relaxed">
              Reach 22,000 captains and crew worldwide. Position your brand alongside the industry's most trusted source for technical expertise, regulatory information, and career advice.
            </p>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center uppercase" style={{ fontFamily: 'Georgia, serif' }}>
              Our Reach
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">22k</div>
                <div className="text-sm font-semibold text-gray-700 uppercase mb-2">Bi-monthly Magazine</div>
                <div className="text-xs text-gray-500">Printed and digital distribution</div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">25k+</div>
                <div className="text-sm font-semibold text-gray-700 uppercase mb-2">Boat Show Daily</div>
                <div className="text-xs text-gray-500">Digital subscribers at FLIBS and Palm Beach shows</div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">27k+</div>
                <div className="text-sm font-semibold text-gray-700 uppercase mb-2">Weekly News Brief</div>
                <div className="text-xs text-gray-500">Email subscribers</div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">2.5M+</div>
                <div className="text-sm font-semibold text-gray-700 uppercase mb-2">Digital & Social Media</div>
                <div className="text-xs text-gray-500">Annual impressions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Advertise Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                Why Advertise With Triton?
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Targeted Audience</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Reach decision-makers in the superyacht industry: captains, crew, yacht managers, and maritime professionals who rely on Triton for essential industry information.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted Authority</h3>
                  <p className="text-gray-600 leading-relaxed">
                    For over 20 years, Triton has been the voice of the yachting industry, providing unparalleled credibility and trust amongst our readership.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Platform Reach</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your message reaches audiences across print, digital, email, and social media platforms, ensuring maximum visibility and engagement.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Options</h3>
                  <p className="text-gray-600 leading-relaxed">
                    From display advertising to sponsored content and custom campaigns, we offer advertising solutions tailored to your marketing objectives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Media Kit Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                  Get In Touch
                </h2>
                <p className="text-gray-600 mb-8">
                  Interested in advertising with Triton? Fill out the form below and our advertising team will contact you within 24 hours.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@company.com"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                      Company *
                    </label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your advertising goals..."
                      rows={5}
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-base uppercase tracking-wide"
                  >
                    {isSubmitting ? "Sending..." : "Send Enquiry"}
                  </Button>
                </form>
              </div>

              {/* Media Kit Download */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                  Media Kit
                </h2>
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                  <div className="mb-6">
                    <img
                      src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663300921591/9RWLGp7nqLBWNqzJ.png"
                      alt="Triton Media Kit 2026"
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Download Our 2026 Media Kit</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Get detailed information about our advertising rates, specifications, deadlines, and audience demographics. Our comprehensive media kit includes everything you need to plan your campaign.
                  </p>
                  <a
                    href="https://files.manuscdn.com/user_upload_by_module/session_file/310519663300921591/Triton%20Media%20Kit%202026.pdf"
                    download
                    className="inline-flex items-center gap-2 w-full justify-center px-6 py-4 bg-gradient-to-r from-primary to-[#00BCD4] text-white font-semibold rounded hover:opacity-90 transition-opacity uppercase tracking-wide"
                  >
                    <Download className="w-5 h-5" />
                    Download Media Kit 2026
                  </a>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    PDF • 2.5 MB
                  </p>
                </div>

                {/* Contact Information */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Direct Contact</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-semibold text-gray-700">Advertising Department</div>
                      <a href="mailto:advertising@thetriton.com" className="text-primary hover:text-[#00BCD4]">
                        advertising@thetriton.com
                      </a>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Phone</div>
                      <a href="tel:+19545241155" className="text-primary hover:text-[#00BCD4]">
                        +1 (954) 524-1155
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
