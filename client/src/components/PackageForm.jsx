import { useState } from "react";
import { useDispatch } from "react-redux";
import { createPackage, updatePackage } from "../redux/packageSlice";

const PackageForm = ({ packageData, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: packageData?.title || "",
    description: packageData?.description || "",
    price: packageData?.price || "",
    duration: packageData?.duration || "",
    location: packageData?.location || "",
    category: packageData?.category || "Adventure",
    maxGroupSize: packageData?.maxGroupSize || 10,
    difficulty: packageData?.difficulty || "Moderate",
    images: packageData?.images?.join(", ") || "",
    included: packageData?.included?.join(", ") || "",
    excluded: packageData?.excluded?.join(", ") || "",
  });

  const categories = [
    "Adventure",
    "Beach",
    "Mountain",
    "Cultural",
    "Wildlife",
    "City",
    "Cruise",
    "Other",
  ];
  const difficulties = ["Easy", "Moderate", "Difficult"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const packagePayload = {
      ...formData,
      price: Number(formData.price),
      maxGroupSize: Number(formData.maxGroupSize),
      images: formData.images
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean),
      included: formData.included
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      excluded: formData.excluded
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (packageData) {
      await dispatch(
        updatePackage({ id: packageData._id, data: packagePayload })
      );
    } else {
      await dispatch(createPackage(packagePayload));
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($) *
          </label>
          <input
            type="number"
            name="price"
            required
            min="0"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          required
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration *
          </label>
          <input
            type="text"
            name="duration"
            required
            placeholder="e.g., 3 days, 1 week"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            required
            placeholder="e.g., Paris, France"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Group Size
          </label>
          <input
            type="number"
            name="maxGroupSize"
            min="1"
            value={formData.maxGroupSize}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URLs (comma separated)
        </label>
        <input
          type="text"
          name="images"
          placeholder="https://image1.jpg, https://image2.jpg"
          value={formData.images}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Included (comma separated)
        </label>
        <input
          type="text"
          name="included"
          placeholder="Hotel, Meals, Guide"
          value={formData.included}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Excluded (comma separated)
        </label>
        <input
          type="text"
          name="excluded"
          placeholder="Flights, Insurance"
          value={formData.excluded}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition"
        >
          {packageData ? "Update Package" : "Create Package"}
        </button>
      </div>
    </form>
  );
};

export default PackageForm;
