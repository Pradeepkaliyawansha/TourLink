import { useState } from "react";
import { useDispatch } from "react-redux";
import { createPackage, updatePackage } from "../redux/packageSlice";
import { Upload, X } from "lucide-react";

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
    included: packageData?.included?.join(", ") || "",
    excluded: packageData?.excluded?.join(", ") || "",
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(
    packageData?.images || []
  );
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length + existingImages.length > 5) {
      alert("You can only upload a maximum of 5 images");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => {
      URL.revokeObjectURL(prev[index]); // Clean up memory
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const packagePayload = new FormData();

      // Append form fields
      packagePayload.append("title", formData.title);
      packagePayload.append("description", formData.description);
      packagePayload.append("price", Number(formData.price));
      packagePayload.append("duration", formData.duration);
      packagePayload.append("location", formData.location);
      packagePayload.append("category", formData.category);
      packagePayload.append("maxGroupSize", Number(formData.maxGroupSize));
      packagePayload.append("difficulty", formData.difficulty);

      // Process included items - append as array items
      const includedItems = formData.included
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      includedItems.forEach((item) => {
        packagePayload.append("included[]", item);
      });

      // Process excluded items - append as array items
      const excludedItems = formData.excluded
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      excludedItems.forEach((item) => {
        packagePayload.append("excluded[]", item);
      });

      // Append existing images (for updates)
      if (packageData) {
        existingImages.forEach((img) => {
          packagePayload.append("existingImages[]", img);
        });
      }

      // Append new image files
      images.forEach((image) => {
        packagePayload.append("images", image);
      });

      if (packageData) {
        await dispatch(
          updatePackage({ id: packageData._id, data: packagePayload })
        ).unwrap();
      } else {
        await dispatch(createPackage(packagePayload)).unwrap();
      }

      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.message || "Error saving package. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price ($) *
          </label>
          <input
            type="number"
            name="price"
            required
            min="0"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          required
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration *
          </label>
          <input
            type="text"
            name="duration"
            required
            placeholder="e.g., 3 days, 1 week"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            required
            placeholder="e.g., Paris, France"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Group Size
          </label>
          <input
            type="number"
            name="maxGroupSize"
            min="1"
            value={formData.maxGroupSize}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Package Images (Max 5)
        </label>

        {/* Existing Images (for edit mode) */}
        {existingImages.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Current Images:
            </p>
            <div className="grid grid-cols-5 gap-2">
              {existingImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Existing ${index + 1}`}
                    className="w-full h-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              New Images:
            </p>
            <div className="grid grid-cols-5 gap-2">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, JPEG (MAX. 5 images)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              onChange={handleImageChange}
              disabled={images.length + existingImages.length >= 5}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Included (comma separated)
        </label>
        <input
          type="text"
          name="included"
          placeholder="Hotel, Meals, Guide"
          value={formData.included}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Excluded (comma separated)
        </label>
        <input
          type="text"
          name="excluded"
          placeholder="Flights, Insurance"
          value={formData.excluded}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? "Uploading..."
            : packageData
            ? "Update Package"
            : "Create Package"}
        </button>
      </div>
    </form>
  );
};

export default PackageForm;
