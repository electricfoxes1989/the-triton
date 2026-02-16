import { useState, useRef } from "react";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { useArticlesByCategory, useEvents } from "@/lib/sanityHooks";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, ExternalLink, Clock } from "lucide-react";

export default function EventsPageNew() {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [view, setView] = useState<"month" | "week" | "list">("month");

  // Fetch events from Sanity
  const { data: events, isLoading } = useEvents();
  
  // Fetch event-related articles
  const { data: eventArticles, isLoading: articlesLoading } = useArticlesByCategory("events", 3);

  // Transform events for FullCalendar
  const calendarEvents = events?.map((event: any) => ({
    id: event._id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    allDay: event.allDay,
    extendedProps: event,
    backgroundColor: getEventColor(event.eventType),
    borderColor: getEventColor(event.eventType),
  })) || [];

  function getEventColor(eventType: string) {
    const colors: Record<string, string> = {
      "boat-show": "#002B5B",
      networking: "#1E5A8E",
      training: "#4A90E2",
      conference: "#7B2CBF",
      social: "#E07A5F",
      other: "#6C757D",
    };
    return colors[eventType] || colors.other;
  }

  function handleEventClick(clickInfo: any) {
    setSelectedEvent(clickInfo.event.extendedProps);
  }

  function handleViewChange(newView: "month" | "week" | "list") {
    setView(newView);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (newView === "month") calendarApi.changeView("dayGridMonth");
      if (newView === "week") calendarApi.changeView("timeGridWeek");
      if (newView === "list") calendarApi.changeView("listMonth");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNew />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0A2342] to-[#00BCD4] text-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">EVENTS</h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            Stay informed about upcoming boat shows, industry conferences,
            networking events, and training opportunities for yacht captains and
            crew.
          </p>
        </div>
      </div>

      {/* Event Articles Section */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">EVENT NEWS & COVERAGE</h2>
              <p className="text-gray-600">Latest updates, previews, and recaps from yacht shows and industry events</p>
            </div>
            <a href="/news" className="text-[#00BCD4] hover:text-[#0A2342] font-semibold transition-colors">
              View All →
            </a>
          </div>

          {articlesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#00BCD4] rounded-full animate-spin" />
            </div>
          ) : eventArticles && eventArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventArticles.slice(0, 3).map((article: any) => (
                <a
                  key={article._id}
                  href={`/article/${article.slug}`}
                  className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {article.mainImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.mainImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block px-3 py-1 bg-[#00BCD4] text-white text-xs font-semibold rounded-full uppercase">
                        Events
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00BCD4] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                    )}
                    {article.author && (
                      <p className="text-sm text-gray-500">
                        By {article.author.name}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No event articles available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="container mx-auto px-6 md:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">EVENT CALENDAR</h2>
          <p className="text-gray-600">Browse upcoming boat shows, conferences, and industry events</p>
        </div>
        
        {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            <Button
              variant={view === "month" ? "default" : "outline"}
              onClick={() => handleViewChange("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              onClick={() => handleViewChange("week")}
            >
              Week
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              onClick={() => handleViewChange("list")}
            >
              List
            </Button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#002B5B" }} />
              <span>Boat Shows</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#1E5A8E" }} />
              <span>Networking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#4A90E2" }} />
              <span>Training</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#7B2CBF" }} />
              <span>Conference</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Card className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#002B5B] rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading events...</p>
              </div>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
              }}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
              }}
            />
          )}
        </Card>

        {/* Empty State */}
        {!isLoading && events?.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events Yet
            </h3>
            <p className="text-gray-600">
              Check back soon for upcoming boat shows, conferences, and industry
              events.
            </p>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedEvent?.startDate &&
                        new Date(selectedEvent.startDate).toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                    </p>
                    {selectedEvent?.endDate &&
                      selectedEvent.startDate !== selectedEvent.endDate && (
                        <p className="text-sm text-gray-600">
                          Until{" "}
                          {new Date(selectedEvent.endDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                  </div>
                </div>

                {/* Location */}
                {selectedEvent?.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      {selectedEvent.location.venue && (
                        <p className="font-medium text-gray-900">
                          {selectedEvent.location.venue}
                        </p>
                      )}
                      {(selectedEvent.location.city ||
                        selectedEvent.location.country) && (
                        <p className="text-sm text-gray-600">
                          {[
                            selectedEvent.location.city,
                            selectedEvent.location.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedEvent?.description && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Organizer */}
                {selectedEvent?.organizer && (
                  <div>
                    <p className="text-sm text-gray-600">
                      Organised by{" "}
                      <span className="font-medium text-gray-900">
                        {selectedEvent.organizer}
                      </span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {selectedEvent?.registrationUrl && (
                    <Button asChild>
                      <a
                        href={selectedEvent.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Register / Get Tickets
                      </a>
                    </Button>
                  )}
                  {selectedEvent?.websiteUrl && (
                    <Button variant="outline" asChild>
                      <a
                        href={selectedEvent.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Event Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
