import { useEffect, useState, useCallback, useMemo } from "react";

const BASE_URL = "https://rickandmortyapi.com/api";

const ENDPOINTS = [
  {
    id: "character",
    url: `${BASE_URL}/character`,
    label: "Characters",
    icon: "👤",
  },
  {
    id: "location",
    url: `${BASE_URL}/location`,
    label: "Locations",
    icon: "🌍",
  },
  {
    id: "episode",
    url: `${BASE_URL}/episode`,
    label: "Episodes",
    icon: "📺",
  },
];

const STATUS_STYLES = {
  alive: "bg-emerald-500 shadow-emerald-500/30",
  dead: "bg-red-500 shadow-red-500/30",
  unknown: "bg-gray-500 shadow-gray-500/30",
} as const;

const GENDER_ICONS = {
  Male: "👨",
  Female: "👩",
  Genderless: "⚪",
  unknown: "❓",
} as const;

interface APIResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Array<{
    id: number;
    name: string;
    status?: "Alive" | "Dead" | "unknown";
    species?: string;
    gender?: keyof typeof GENDER_ICONS;
    image?: string;
    location?: { name: string };
    origin?: { name: string };
    type?: string;
    dimension?: string;
    residents?: string[];
    characters?: string[];
    episode?: string;
    air_date?: string;
    created: string;
  }>;
}

function App() {
  const [activeEndpoint, setActiveEndpoint] = useState("character");
  const [data, setData] = useState<APIResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const currentEndpoint = ENDPOINTS.find((e) => e.id === activeEndpoint);
  const totalPages = data?.info?.pages || 1;

  const fetchData = useCallback(
    async (endpoint: string, page: number, search?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParam = search ? `&name=${encodeURIComponent(search)}` : "";
        const url = `${BASE_URL}/${endpoint}?page=${page}${searchParam}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(activeEndpoint, currentPage, searchTerm);
  }, [fetchData, activeEndpoint, currentPage, searchTerm]);

  const handleEndpointChange = (endpointId: string) => {
    setActiveEndpoint(endpointId);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const paginationRange = useMemo(() => {
    const range = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) range.push(i);
        range.push("ellipsis");
        range.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        range.push(1);
        range.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) range.push(i);
      } else {
        range.push(1);
        range.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i);
        range.push("ellipsis");
        range.push(totalPages);
      }
    }

    return range;
  }, [currentPage, totalPages]);

  const renderItem = (item: APIResponse["results"][0]) => {
    if (activeEndpoint === "character") {
      return (
        <div className="group">
          <div className="relative">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <div
                className={`w-4 h-4 rounded-full ${
                  STATUS_STYLES[
                    item.status?.toLowerCase() as keyof typeof STATUS_STYLES
                  ] || STATUS_STYLES.unknown
                } shadow-lg`}
                title={`Status: ${item.status}`}
              />
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {item.name}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {GENDER_ICONS[item.gender as keyof typeof GENDER_ICONS] ||
                    "❓"}
                </span>
                <span>
                  {item.status} - {item.species}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🌍</span>
                <span>Location: {item.location?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <span>Origin: {item.origin?.name || "Unknown"}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeEndpoint === "location") {
      return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">{item.name}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              <span>Type: {item.type || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌌</span>
              <span>Dimension: {item.dimension || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <span>Residents: {item.residents?.length || 0}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{item.name}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span>Air Date: {item.air_date || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <span>Episode: {item.episode || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <span>Characters: {item.characters?.length || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData(activeEndpoint, currentPage, searchTerm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rick & Morty Explorer
            </h1>
            <p className="text-gray-600 mt-2">
              Explore characters, locations, and episodes from the multiverse
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {ENDPOINTS.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => handleEndpointChange(endpoint.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeEndpoint === endpoint.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
                }`}
              >
                <span className="text-xl">{endpoint.icon}</span>
                {endpoint.label}
              </button>
            ))}
          </div>

          {/* Search */}
          {activeEndpoint === "character" && (
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                <span className="absolute left-4 top-3.5 text-gray-400 text-xl">
                  🔍
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Loading...
              </h2>
              <p className="text-gray-600">
                Fetching data from the multiverse...
              </p>
            </div>
          </div>
        ) : !data?.results?.length ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No results found
            </h2>
            <p className="text-gray-600">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-8 text-center">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold">{data.results.length}</span> of{" "}
                <span className="font-semibold">{data.info.count}</span>{" "}
                {currentEndpoint?.label.toLowerCase()}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {data.results.map((item) => (
                <div
                  key={item.id}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  {renderItem(item)}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border font-semibold transition-all duration-300"
                >
                  ← Previous
                </button>

                {paginationRange.map((page, index) =>
                  page === "ellipsis" ? (
                    <span key={index} className="px-3 py-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(page as number)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        currentPage === page
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border font-semibold transition-all duration-300"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
