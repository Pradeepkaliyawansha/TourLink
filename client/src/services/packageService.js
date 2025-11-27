import axiosInstance from "./axiosInstance";

// Get all packages
const getPackages = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axiosInstance.get(`/packages?${params}`);
  return response.data.data;
};

// Get single package
const getPackage = async (id) => {
  const response = await axiosInstance.get(`/packages/${id}`);
  return response.data.data;
};

// Get my packages (guide only)
const getMyPackages = async (token) => {
  const response = await axiosInstance.get("/packages/guide/my-packages", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

// Create package
const createPackage = async (packageData, token) => {
  const response = await axiosInstance.post("/packages", packageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

// Update package
const updatePackage = async (id, packageData, token) => {
  const response = await axiosInstance.put(`/packages/${id}`, packageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

// Delete package
const deletePackage = async (id, token) => {
  const response = await axiosInstance.delete(`/packages/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const packageService = {
  getPackages,
  getPackage,
  getMyPackages,
  createPackage,
  updatePackage,
  deletePackage,
};

export default packageService;
