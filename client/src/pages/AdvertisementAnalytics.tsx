import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import { ArrowUpDown, TrendingUp, Eye, MousePointerClick, ExternalLink } from "lucide-react";

export default function AdvertisementAnalytics() {
  const { data: advertisements, isLoading } = trpc.analytics.allAdvertisements.useQuery();
  const [sortField, setSortField] = useState<"priority" | "impressions" | "clicks" | "ctr">("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Calculate CTR and sort advertisements
  const processedAds = useMemo(() => {
    if (!advertisements) return [];

    // Add CTR calculation
    const adsWithCTR = advertisements.map(ad => ({
      ...ad,
      ctr: ad.impressions && ad.impressions > 0 
        ? ((ad.clicks || 0) / ad.impressions) * 100 
        : 0
    }));

    // Filter by status
    let filtered = adsWithCTR;
    if (filterStatus === "active") {
      filtered = adsWithCTR.filter(ad => ad.isActive);
    } else if (filterStatus === "inactive") {
      filtered = adsWithCTR.filter(ad => !ad.isActive);
    }

    // Sort
    return filtered.sort((a, b) => {
      let aVal = a[sortField] || 0;
      let bVal = b[sortField] || 0;

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [advertisements, sortField, sortDirection, filterStatus]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!processedAds.length) return { impressions: 0, clicks: 0, ctr: 0 };

    const totalImpressions = processedAds.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
    const totalClicks = processedAds.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: avgCTR
    };
  }, [processedAds]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    return num.toLocaleString();
  };

  const formatCTR = (ctr: number) => {
    return `${ctr.toFixed(2)}%`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNew />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A2342] to-[#0d3a5f] text-white py-16">
        <div className="container mx-auto px-6 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Advertisement Analytics</h1>
          <p className="text-xl text-gray-300">Performance metrics and insights for all banner advertisements</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900 uppercase tracking-wide">Total Ads</h3>
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-blue-900">{processedAds.length}</p>
              <p className="text-xs text-blue-700 mt-1">
                {processedAds.filter(ad => ad.isActive).length} active
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-900 uppercase tracking-wide">Total Impressions</h3>
                <Eye className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-green-900">{formatNumber(totals.impressions)}</p>
              <p className="text-xs text-green-700 mt-1">Views across all ads</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-900 uppercase tracking-wide">Total Clicks</h3>
                <MousePointerClick className="text-purple-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-purple-900">{formatNumber(totals.clicks)}</p>
              <p className="text-xs text-purple-700 mt-1">Clicks across all ads</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-orange-900 uppercase tracking-wide">Average CTR</h3>
                <TrendingUp className="text-orange-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-orange-900">{formatCTR(totals.ctr)}</p>
              <p className="text-xs text-orange-700 mt-1">Click-through rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-[#0A2342] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({advertisements?.length || 0})
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active ({advertisements?.filter(ad => ad.isActive).length || 0})
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "inactive"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inactive ({advertisements?.filter(ad => !ad.isActive).length || 0})
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Showing {processedAds.length} advertisement{processedAds.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Advertisements Table */}
      <div className="container mx-auto px-6 md:px-8 py-8">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2342] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading advertisements...</p>
          </div>
        ) : processedAds.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TrendingUp className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Advertisements Found</h3>
            <p className="text-gray-600">
              {filterStatus === "all" 
                ? "No advertisements have been created yet."
                : `No ${filterStatus} advertisements found.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Advertisement
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Targeting
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("priority")}
                    >
                      <div className="flex items-center gap-1">
                        Priority
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("impressions")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Impressions
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("clicks")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Clicks
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("ctr")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CTR
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedAds.map((ad) => (
                    <tr key={ad._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title}
                            className="w-24 h-16 object-cover rounded border border-gray-200"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{ad.title}</div>
                            {ad.advertiser && (
                              <div className="text-sm text-gray-500">{ad.advertiser}</div>
                            )}
                            <a 
                              href={ad.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                            >
                              <ExternalLink size={12} />
                              {new URL(ad.link).hostname}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 capitalize">{ad.position.replace(/-/g, " ")}</div>
                          <div className="text-gray-500">
                            {ad.pageTargeting.includes("all") 
                              ? "All pages" 
                              : ad.pageTargeting.map(p => p.replace(/-/g, " ")).join(", ")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>{formatDate(ad.startDate)}</div>
                          {ad.endDate && (
                            <div className="text-gray-500">to {formatDate(ad.endDate)}</div>
                          )}
                          {!ad.endDate && (
                            <div className="text-gray-500">No end date</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ad.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">{formatNumber(ad.impressions)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">{formatNumber(ad.clicks)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`text-sm font-medium ${
                          ad.ctr > 5 ? "text-green-600" : ad.ctr > 2 ? "text-yellow-600" : "text-gray-900"
                        }`}>
                          {formatCTR(ad.ctr)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ad.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
