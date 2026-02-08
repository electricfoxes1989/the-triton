import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";

// Events data — these would come from Sanity in a full integration
const events = [
  {
    id: 1,
    title: "Seattle Boat Show",
    slug: "seattle-boat-show-2026",
    description: "The Pacific Northwest's largest boat show featuring hundreds of boats, accessories, and marine services.",
    startDate: new Date("2026-01-30"),
    endDate: new Date("2026-02-08"),
    location: "Seattle, WA",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    externalUrl: "https://seattleboatshow.com",
  },
  {
    id: 2,
    title: "Miami International Boat Show",
    slug: "miami-boat-show-2026",
    description: "One of the largest boat shows in the world, showcasing the latest in yachts, marine technology, and accessories.",
    startDate: new Date("2026-02-12"),
    endDate: new Date("2026-02-16"),
    location: "Miami, FL",
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&h=400&fit=crop",
    externalUrl: "https://miamiboatshow.com",
  },
  {
    id: 3,
    title: "Palm Beach International Boat Show",
    slug: "palm-beach-boat-show-2026",
    description: "A premier boat show featuring luxury yachts along the Intracoastal Waterway in downtown West Palm Beach.",
    startDate: new Date("2026-03-26"),
    endDate: new Date("2026-03-29"),
    location: "West Palm Beach, FL",
    imageUrl: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=600&h=400&fit=crop",
    externalUrl: "https://pbboatshow.com",
  },
  {
    id: 4,
    title: "Monaco Yacht Show",
    slug: "monaco-yacht-show-2026",
    description: "The world's most prestigious superyacht show, featuring the finest luxury yachts and marine products.",
    startDate: new Date("2026-09-23"),
    endDate: new Date("2026-09-26"),
    location: "Monaco",
    imageUrl: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&h=400&fit=crop",
    externalUrl: "https://monacoyachtshow.com",
  },
  {
    id: 5,
    title: "Fort Lauderdale International Boat Show",
    slug: "fort-lauderdale-boat-show-2026",
    description: "The world's largest in-water boat show, featuring thousands of boats and marine products.",
    startDate: new Date("2026-10-28"),
    endDate: new Date("2026-11-01"),
    location: "Fort Lauderdale, FL",
    imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=600&h=400&fit=crop",
    externalUrl: "https://flibs.com",
  },
];

export default function Events() {
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.startDate) >= now);
  const pastEvents = events.filter(e => new Date(e.startDate) < now);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b border-gray-100">
          <div className="container py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A1628] mb-4 font-serif">
              Events
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl font-sans">
              Boat shows, industry conferences, and networking events for yacht professionals worldwide.
            </p>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-12">
          <div className="container">
            <h2 className="text-[11px] font-sans font-semibold tracking-widest uppercase text-gray-400 mb-8">
              Upcoming
            </h2>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-0">
                {upcomingEvents.map((event) => (
                  <article key={event.id} className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-8 border-b border-gray-100">
                    {/* Date column */}
                    <div className="md:col-span-2">
                      <p className="text-3xl font-bold text-[#0A1628] font-serif">
                        {format(new Date(event.startDate), "MMM d")}
                      </p>
                      {event.endDate && (
                        <p className="text-sm text-gray-400 font-sans">
                          – {format(new Date(event.endDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>

                    {/* Image */}
                    <div className="md:col-span-4">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="md:col-span-6 flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-[#0A1628] mb-2 font-serif">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3 font-sans">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 font-sans">
                        {event.description}
                      </p>
                      {event.externalUrl && (
                        <a
                          href={event.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0A1628] hover:text-[#3ECFB2] transition-colors font-sans"
                        >
                          Visit Website <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 font-sans">No upcoming events at this time.</p>
            )}
          </div>
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container">
              <h2 className="text-[11px] font-sans font-semibold tracking-widest uppercase text-gray-400 mb-8">
                Past Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <article key={event.id} className="py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-sans">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(event.startDate), "MMM d, yyyy")}
                    </div>
                    <h3 className="font-bold text-[#0A1628] mb-1 font-serif">{event.title}</h3>
                    <p className="text-sm text-gray-400 font-sans">{event.location}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
