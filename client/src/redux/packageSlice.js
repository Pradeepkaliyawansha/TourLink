import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import packageService from "../services/packageService";

const initialState = {
  packages: [],
  myPackages: [],
  currentPackage: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Get all packages
export const getPackages = createAsyncThunk(
  "packages/getAll",
  async (filters, thunkAPI) => {
    try {
      return await packageService.getPackages(filters);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get my packages (guide only)
export const getMyPackages = createAsyncThunk(
  "packages/getMy",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await packageService.getMyPackages(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create package
export const createPackage = createAsyncThunk(
  "packages/create",
  async (packageData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await packageService.createPackage(packageData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update package
export const updatePackage = createAsyncThunk(
  "packages/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await packageService.updatePackage(id, data, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete package
export const deletePackage = createAsyncThunk(
  "packages/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await packageService.deletePackage(id, token);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const packageSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPackages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.packages = action.payload;
      })
      .addCase(getPackages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMyPackages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyPackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myPackages = action.payload;
      })
      .addCase(getMyPackages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createPackage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myPackages.push(action.payload);
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.myPackages.findIndex(
          (pkg) => pkg._id === action.payload._id
        );
        if (index !== -1) {
          state.myPackages[index] = action.payload;
        }
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myPackages = state.myPackages.filter(
          (pkg) => pkg._id !== action.payload
        );
      });
  },
});

export const { reset } = packageSlice.actions;
export default packageSlice.reducer;
