// client/src/pages/AllPackages.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPackages } from "../redux/packageSlice";
import PackageCard from "../components/PackageCard";
import { Search, Filter } from "lucide-react";

const AllPackages = () => {
  const dispatch = useDispatch();
  const { packages, isLoading } = useSelector((state) => state.packages);

  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    minPrice: "",
    maxPrice: "",
    sort: "createdAt",
  });

  const categories = [
    "All",
    "Adventure",
    "Beach",
    "Mountain",
    "Cultural",
    "Wildlife",
    "City",
    "Cruise",
    "Other",
  ];

  useEffect(() => {
    const filterParams = {};
    if (filters.search) filterParams.search = filters.search;
    if (filters.category !== "All") filterParams.category = filters.category;
    if (filters.minPrice) filterParams.minPrice = filters.minPrice;
    if (filters.maxPrice) filterParams.maxPrice = filters.maxPrice;
    if (filters.sort) filterParams.sort = filters.sort;

    dispatch(getPackages(filterParams));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Explore Tour Packages
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover amazing destinations and experiences
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filter & Search
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              name="search"
              placeholder="Search packages..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Category */}
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Min Price */}
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          {/* Max Price */}
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          {/* Sort */}
          <select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No packages found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              Found <span className="font-semibold">{packages.length}</span>{" "}
              packages
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllPackages;
