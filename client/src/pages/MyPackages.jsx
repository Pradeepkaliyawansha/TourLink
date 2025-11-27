// client/src/pages/MyPackages.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyPackages, deletePackage } from "../redux/packageSlice";
import PackageForm from "../components/PackageForm";
import { Plus, Trash2, Edit, MapPin } from "lucide-react";

const MyPackages = () => {
  const dispatch = useDispatch();
  const { myPackages, isLoading } = useSelector((state) => state.packages);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  useEffect(() => {
    dispatch(getMyPackages());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      await dispatch(deletePackage(id));
      dispatch(getMyPackages());
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPackage(null);
    dispatch(getMyPackages());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Packages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tour packages
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Package Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPackage ? "Edit Package" : "Create New Package"}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <PackageForm
                packageData={editingPackage}
                onClose={handleFormClose}
              />
            </div>
          </div>
        </div>
      )}

      {/* Packages List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      ) : myPackages.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No packages yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first tour package to get started
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <Plus className="h-5 w-5" />
            <span>Create Package</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {myPackages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-1/4 h-48 md:h-auto bg-gray-200 dark:bg-gray-700">
                  {pkg.images && pkg.images.length > 0 ? (
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium px-2.5 py-0.5 rounded">
                          {pkg.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {pkg.isActive ? "✅ Active" : "❌ Inactive"}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {pkg.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {pkg.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        ${pkg.price}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {pkg.duration}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Location:</span>{" "}
                      {pkg.location}
                    </div>
                    <div>
                      <span className="font-medium">Max Group:</span>{" "}
                      {pkg.maxGroupSize}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span>{" "}
                      {pkg.difficulty}
                    </div>
                    <div>
                      <span className="font-medium">Rating:</span> ⭐{" "}
                      {pkg.rating.toFixed(1)} ({pkg.reviews?.length || 0})
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPackages;
