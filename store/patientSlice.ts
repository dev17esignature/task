/**
 * Patient Redux Slice
 *
 * This slice manages patient data state including:
 * - Fetching patients from API
 * - Creating new patients
 * - Error handling and loading states
 
 *  */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api/api";
import { endpoints } from "../api/url";

/**
 * Patient interface representing a patient/relative in the system
 */
export interface Patient {
  /** Unique identifier for the patient */
  id: string;
  /** Patient's first name */
  firstName: string;
  /** Patient's last name */
  lastName: string;
  /** Patient's gender */
  gender: string;
  /** Patient's age */
  age: string;
  /** Age type (Years, Months, Days) */
  year: string;
  /** Date of birth in YYYY/MM/DD format */
  dateOfBirth: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Relationship to the user */
  relationship: string;
  /** District name */
  district: string;
  /** VDC/Municipality */
  vdcMunicipality: string;
  /** Ward number */
  wardNo: string;
  /** Tole/Address */
  tole: string;
  /** Record creation timestamp */
  createdAt: string;
  /** Record update timestamp */
  updatedAt: string;
}

/**
 * Form data structure for creating/editing patients
 */
export interface PatientFormData {
  firstName: string;
  lastName: string;
  gender: string;
  age: string;
  year: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  relationship: string;
  district: string;
  vdcMunicipality: string;
  wardNo: string;
  tole: string;
}

/**
 * API response structure for patient operations
 */
interface PatientApiResponse {
  message: string;
  response: {
    list?: any[];
    my?: any;
    [key: string]: any;
  };
  type: "success" | "error";
}

/**
 * Redux state structure for patient management
 */
export interface PatientState {
  /** Array of patients */
  patients: Patient[];
  /** Loading state indicator */
  loading: boolean;
  /** Error message if any operation fails */
  error: string | null;
  /** Success message for user feedback */
  successMessage: string | null;
}

// ===== INITIAL STATE =====

const initialState: PatientState = {
  patients: [],
  loading: false,
  error: null,
  successMessage: null,
};

// ===== UTILITY FUNCTIONS =====

/**
 * Maps relationship string to API relationship ID
 * @param relationship - Relationship type
 * @returns Relationship ID for API
 */
function getRelationshipId(relationship: string): string {
  const relationMap: Record<string, string> = {
    spouse: "1",
    father: "2",
    mother: "2",
    parent: "3",
    child: "4",
    son: "4",
    daughter: "4",
    sibling: "5",
    brother: "5",
    sister: "5",
    grandparent: "6",
    grandchild: "7",
    relative: "8",
    other: "9",
  };
  return relationMap[relationship.toLowerCase()] || "9";
}

/**
 * Maps district name to API district ID
 * @param district - District name
 * @returns District ID for API
 */
function getDistrictId(district: string): string {
  const districtMap: Record<string, string> = {
    kathmandu: "46",
    lalitpur: "47",
    bhaktapur: "47",
    chitwan: "28",
    pokhara: "37",
    biratnagar: "56",
    birgunj: "52",
    dharan: "61",
    butwal: "35",
    hetauda: "50",
  };
  return districtMap[district.toLowerCase()] || "46";
}

/**
 * Maps VDC/Municipality to API VDC ID
 * @param vdcMunicipality - VDC/Municipality identifier
 * @returns VDC ID for API
 */
function getVdcId(vdcMunicipality: string): string {
  const vdcMap: Record<string, string> = {
    municipality_a: "1147",
    municipality_b: "1148",
    municipality_c: "1149",
    vdc_a: "1150",
    vdc_b: "1151",
  };
  return vdcMap[vdcMunicipality.toLowerCase()] || "1147";
}

/**
 * Transforms raw API response to Patient interface
 * @param apiPatient - Raw patient data from API
 * @returns Formatted Patient object
 */
function transformPatientData(apiPatient: any): Patient {
  return {
    id: apiPatient.midasid || apiPatient.userid || "unknown",
    firstName: apiPatient.fname || "",
    lastName: apiPatient.lname || "",
    gender: apiPatient.gender?.toLowerCase().trim() || "",
    age: calculateAge(apiPatient.dobbs || apiPatient.dobad),
    year: "Years",
    dateOfBirth: apiPatient.dobbs || apiPatient.dobad || "",
    email: apiPatient.emailaddress || "",
    phone: apiPatient.mobilenumber || apiPatient.phone || "",
    relationship: apiPatient.user_type === "self" ? "self" : "relative",
    district: `District ${apiPatient.districtname || "undefined"}`,
    vdcMunicipality: `Municipality ${apiPatient.vdcname || "A"}`,
    wardNo: apiPatient.wardno || "1",
    tole: apiPatient.address || "Unknown",
    createdAt: formatDate(apiPatient.createddate),
    updatedAt: formatDate(apiPatient.datapostdatetime),
  };
}

/**
 * Calculates age from date of birth
 * @param dob - Date of birth string
 * @returns Age as string
 */
function calculateAge(dob: string): string {
  if (!dob) return "Unknown";

  try {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return String(age - 1);
    }

    return String(age);
  } catch {
    return "Unknown";
  }
}

/**
 * Formats date string for display
 * @param dateStr - Raw date string
 * @returns Formatted date
 */
function formatDate(dateStr: string): string {
  if (!dateStr)
    return new Date().toISOString().split("T")[0].replace(/-/g, "/");

  try {
    return new Date(dateStr).toISOString().split("T")[0].replace(/-/g, "/");
  } catch {
    return new Date().toISOString().split("T")[0].replace(/-/g, "/");
  }
}

// ===== ASYNC THUNKS =====

/**
 * Fetches patients from the API
 * Handles both user's own data and relatives list
 */
export const fetchPatients = createAsyncThunk<
  Patient[],
  void,
  { rejectValue: string }
>("patients/fetchPatients", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post<PatientApiResponse>(
      endpoints.getPatients,
      {}
    );

    if (response.data.type !== "success") {
      return rejectWithValue("Failed to fetch patients from server");
    }

    const { list = [], my } = response.data.response;
    const patients: Patient[] = [];

    // Add user's own data if available
    if (my) {
      patients.push(transformPatientData(my));
    }

    // Add relatives data
    if (Array.isArray(list) && list.length > 0) {
      list.forEach((relative: any) => {
        if (relative && typeof relative === "object") {
          patients.push(transformPatientData(relative));
        }
      });
    }

    return patients;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Network error occurred while fetching patients";
    return rejectWithValue(errorMessage);
  }
});

/**
 * Creates a new patient/relative
 * Transforms form data to API format and handles the request
 */
export const createPatient = createAsyncThunk<
  PatientApiResponse,
  PatientFormData,
  { rejectValue: string }
>("patients/createPatient", async (patientData, { rejectWithValue }) => {
  try {
    // Transform form data to API format
    const apiData = {
      fname: patientData.firstName,
      lname: patientData.lastName,
      gender: patientData.gender === "male" ? "Male" : "Female",
      age: patientData.age,
      agetype: patientData.year,
      email: patientData.email,
      mobileno: patientData.phone,
      countrycode: "977",
      relationid: getRelationshipId(patientData.relationship),
      districtid: getDistrictId(patientData.district),
      vdcid: getVdcId(patientData.vdcMunicipality),
      wardno: patientData.wardNo,
      address: patientData.tole,
      addtorelative: "Y",
    };

    const response = await api.post<PatientApiResponse>(
      endpoints.addPatient,
      apiData
    );

    if (response.data.type !== "success") {
      return rejectWithValue(
        response.data.message || "Failed to create patient"
      );
    }

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Network error occurred while creating patient";
    return rejectWithValue(errorMessage);
  }
});


// export const deletePatient = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("patients/deletePatient", async (patientId, { rejectWithValue }) => {
//   try {
//     // Note: Implement actual delete API call when endpoint is available
//     // const response = await api.delete(`${endpoints.deletePatient}/${patientId}`);

//     // Simulated delay for demo purposes
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     return patientId;
//   } catch (error: any) {
//     const errorMessage =
//       error?.response?.data?.message ||
//       error?.message ||
//       "Network error occurred while deleting patient";
//     return rejectWithValue(errorMessage);
//   }
// });

// ===== REDUX SLICE =====

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    /**
     * Clears any error messages
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Clears success messages
     */
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },

    /**
     * Resets the entire patient state to initial values
     */
    resetPatientState: (state) => {
      state.patients = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },

    /**
     * Updates a specific patient in the state
     */
    updatePatient: (state, action: PayloadAction<Patient>) => {
      const index = state.patients.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.patients[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch patients async actions
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create patient async actions
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    //   // Delete patient async actions
    //   .addCase(deletePatient.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(deletePatient.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.patients = state.patients.filter((p) => p.id !== action.payload);
    //     state.successMessage = "Patient deleted successfully";
    //     state.error = null;
    //   })
    //   .addCase(deletePatient.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload as string;
    //   });
  },
});

// ===== EXPORTS =====

export const {
  clearError,
  clearSuccessMessage,
  resetPatientState,
  updatePatient,
} = patientSlice.actions;

export default patientSlice.reducer;

// ===== SELECTORS =====

/**
 * Selector to get all patients
 */
export const selectAllPatients = (state: { patients: PatientState }) =>
  state.patients.patients;

/**
 * Selector to get loading state
 */
export const selectPatientsLoading = (state: { patients: PatientState }) =>
  state.patients.loading;

/**
 * Selector to get error state
 */
export const selectPatientsError = (state: { patients: PatientState }) =>
  state.patients.error;

/**
 * Selector to get success message
 */
export const selectPatientsSuccessMessage = (state: {
  patients: PatientState;
}) => state.patients.successMessage;

/**
 * Selector to get patient by ID
 */
export const selectPatientById = (
  state: { patients: PatientState },
  patientId: string
) => state.patients.patients.find((patient) => patient.id === patientId);
