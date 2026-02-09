import { useState } from "react";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Download } from "lucide-react";

export default function MagazinePage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);

  // Fetch all magazine issues
  const { data: issues, isLoading } = trpc.magazines.list.useQuery();

  // Get unique years from issues
  const years: number[] = issues
    ? (Array.from(
        new Set(
          issues.map((issue: any) =>
            new Date(issue.publishDate).getFullYear()
          )
        )
      ) as number[]).sort((a, b) => b - a)
    : [];

  // Filter issues by selected year
  const filteredIssues = selectedYear
    ? issues?.filter(
        (issue: any) => new Date(issue.publishDate).getFullYear() === selectedYear
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNew />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#002B5B] to-[#1E5A8E] text-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">MAGAZINES</h1>
          <p className="text-xl text-gray-200 max-w-3xl">
            Browse our complete archive of Triton magazines. Each issue features
            in-depth articles, industry insights, and the latest news for yacht
            captains and crew.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 md:px-8 py-12">
        {/* Year Navigation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            VIEW PAST MAGAZINES
          </h2>
          <div className="flex flex-wrap gap-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading years...</span>
              </div>
            ) : (
              years.map((year: number) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  onClick={() => {
                    setSelectedYear(year as number);
                    setSelectedIssue(null);
                  }}
                  className="text-lg font-semibold"
                >
                  {year}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Issue Grid */}
        {selectedYear && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {selectedYear} Issues
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredIssues?.map((issue: any) => (
                <Card
                  key={issue._id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                    {issue.coverImage ? (
                      <img
                        src={issue.coverImage}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#002B5B] to-[#1E5A8E] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          TRITON
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {issue.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(issue.publishDate).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Issuu Viewer Modal/Section */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedIssue.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedIssue.publishDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedIssue.pdfUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={selectedIssue.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIssue(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Issuu Embed */}
              <div className="flex-1 overflow-hidden">
                {selectedIssue.issuuEmbedUrl ? (
                  <iframe
                    src={selectedIssue.issuuEmbedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={selectedIssue.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Magazine viewer not available
                      </p>
                      {selectedIssue.pdfUrl && (
                        <Button asChild>
                          <a
                            href={selectedIssue.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedYear && !isLoading && (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Year
            </h3>
            <p className="text-gray-600">
              Choose a year above to browse magazine issues from that period
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
