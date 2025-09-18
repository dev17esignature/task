import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { endpoints } from './url';

/**
 * Interface for creating a new relative request to the API
 */
export interface CreateRelativeRequest {
  fname: string;        // First name
  lname: string;        // Last name  
  age: string;          // Age
  agetype: string;      // Age type (Years, Months, etc.)
  countrycode: string;  // Country code
  mobileno: string;     // Mobile number
  email?: string;       // Email (optional)
  gender: string;       // Gender (Male/Female)
  relationid: string;   // Relation ID
  address?: string;     // Address (optional)
  districtid: string;   // District ID
  vdcid: string;        // VDC/Municipality ID
  wardno: string;       // Ward number
  addtorelative: string; // Add to relative flag
}

/**
 * Interface for the API response when creating a relative
 */
export interface CreateRelativeResponse {
  type: string;
  message: string;
  response: {
    relativemidasuserid: number;
    userid: boolean;
    fname: string;
    lname: string;
    districtid: string;
    vdcid: string;
    address: string;
    countrycode: string;
  };
}

/**
 * Form data interface used by UI components
 */
export interface CreatePatientData {
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
 * Patient interface representing the complete patient/relative data structure
 */
export interface Patient {
  id: string;
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
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Query keys factory for React Query caching strategy
 * Provides hierarchical key structure for better cache management
 */
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: string) => [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

/**
 * React Query hook to fetch all patients from the API
 * @returns Query object containing patients data, loading state, and error state
 */
export const usePatients = () => {
  return useQuery({
    queryKey: patientKeys.lists(),
    queryFn: async (): Promise<Patient[]> => {
      // Create URL-encoded form data as shown in the API screenshot
      const params = new URLSearchParams();
      params.append('userid', '1000596100');
      params.append('orgid', '614');
      
      const response = await api.post(endpoints.getPatients, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Transform the API response to match our Patient interface
      // Based on the API response: { type: "success", message: "Relative List", response: { list: [...] } }
      if (response.data && response.data.response && response.data.response.list && Array.isArray(response.data.response.list)) {
        const transformedPatients = response.data.response.list.map((relative: any) => {
          
          return {
            id: relative.userid?.toString() || Date.now().toString(),
            firstName: relative.fname || '',
            lastName: relative.lname || '',
            gender: relative.gender?.toLowerCase() || 'unknown',
            age: calculateAge(relative.dobad, relative.dobbs) || '0',
            year: 'Years',
            dateOfBirth: relative.dobad || '1990-01-01',
            email: relative.emailaddress || '',
            phone: relative.mobilenumber || '',
            relationship: getRelationshipName(relative.relationid) || 'relative',
            district: getDistrictName(relative.districtid) || 'Unknown',
            vdcMunicipality: getVdcName(relative.vdcid) || 'Unknown',
            wardNo: relative.wardno || '1',
            tole: relative.address || 'Unknown',
            createdAt: relative.createddate || new Date().toISOString(),
            updatedAt: relative.createddate || new Date().toISOString(),
          };
        });
        
        return transformedPatients;
      }
      
      // Return empty array if no data
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * React Query hook to fetch a single patient by ID
 * @param id - The patient ID to fetch
 * @returns Query object containing patient data, loading state, and error state
 */
export const usePatient = (id: string) => {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: async (): Promise<Patient> => {
      const response = await api.get(`/users/${id}`);
      const user = response.data;
      
      return {
        id: user.id.toString(),
        firstName: user.name.split(' ')[0] || user.name,
        lastName: user.name.split(' ').slice(1).join(' ') || 'User',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        age: Math.floor(Math.random() * 50 + 20).toString(),
        year: new Date().getFullYear().toString(),
        dateOfBirth: '1990-01-01',
        email: user.email,
        phone: user.phone,
        relationship: 'relative',
        district: user.address?.city || 'Unknown',
        vdcMunicipality: user.address?.suite || 'Unknown',
        wardNo: '1',
        tole: user.address?.street || 'Unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    enabled: !!id, // Only run if id exists
  });
};

/**
 * React Query mutation hook to create a new patient/relative
 * @returns Mutation object with mutate function and loading/error states
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientData): Promise<CreateRelativeResponse> => {
      // Transform form data to API format
      const apiData: CreateRelativeRequest = {
        fname: data.firstName,
        lname: data.lastName,
        age: data.age,
        agetype: data.year || 'Years', // Default to Years if not specified
        countrycode: '977', // Default Nepal country code
        mobileno: cleanPhoneNumber(data.phone), // Clean phone number properly
        email: data.email,
        gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1), // Capitalize first letter
        relationid: getRelationId(data.relationship), // Convert relationship to ID
        address: data.tole,
        districtid: getDistrictId(data.district), // Convert district to ID
        vdcid: getVdcId(data.vdcMunicipality), // Convert VDC to ID
        wardno: data.wardNo,
        addtorelative: 'Y' // Always add to relative
      };

      // Create URL-encoded form data like the working API call
      const formData = new URLSearchParams();
      Object.entries(apiData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await api.post(endpoints.addPatient, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return response.data;
    },
    onSuccess: (response) => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to create relative:', error);
      console.error('Error response:', error.response?.data);
    },
  });
};

// Helper functions to convert form values to API IDs
function getRelationId(relationship: string): string {
  const relationMap: { [key: string]: string } = {
    'spouse': '1',
    'child': '2', 
    'parent': '3',
    'sibling': '4',
    'grandparent': '5',
    'grandchild': '6',
    'relative': '9',
    'other': '9'
  };
  return relationMap[relationship.toLowerCase()] || '9';
}

function getDistrictId(district: string): string {
  // You'll need to map your district names to IDs
  // For now returning a default ID, you should implement proper mapping
  const districtMap: { [key: string]: string } = {
    'kathmandu': '45',
    'lalitpur': '46',
    'bhaktapur': '47',
    // Add more districts as needed
  };
  return districtMap[district.toLowerCase()] || '45'; // Default to Kathmandu
}

function getVdcId(vdcMunicipality: string): string {
  // You'll need to map your VDC/Municipality names to IDs
  // For now returning a default ID
  const vdcMap: { [key: string]: string } = {
    'municipality_a': '1147',
    'municipality_b': '1148',
    // Add more VDCs as needed
  };
  return vdcMap[vdcMunicipality.toLowerCase()] || '1147'; // Default
}

// Helper function to convert relation ID back to name
function getRelationshipName(relationId: string | number): string {
  const relationMap: { [key: string]: string } = {
    '1': 'spouse',
    '2': 'child', 
    '3': 'parent',
    '4': 'sibling',
    '5': 'grandparent',
    '6': 'grandchild',
    '9': 'relative',
  };
  return relationMap[relationId?.toString()] || 'relative';
}

/**
 * React Query mutation hook to update an existing patient
 * @returns Mutation object with mutate function and loading/error states
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePatientData> }): Promise<Patient> => {
      // Get the existing patient
      const existingPatient = queryClient.getQueryData<Patient>(patientKeys.detail(id));
      
      if (!existingPatient) {
        throw new Error('Patient not found');
      }
      
      const updatedPatient: Patient = {
        ...existingPatient,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      // In real app: const response = await api.put(`/patients/${id}`, data);
      // return response.data;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return updatedPatient;
    },
    onSuccess: (updatedPatient) => {
      // Update the specific patient in cache
      queryClient.setQueryData(patientKeys.detail(updatedPatient.id), updatedPatient);
      
      // Invalidate patients list to refetch
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update patient:', error);
    },
  });
};

/**
 * React Query mutation hook to delete a patient
 * @returns Mutation object with mutate function and loading/error states
 */
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // In real app: await api.delete(`/patients/${id}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: (_, deletedId) => {
      // Remove patient from cache
      queryClient.removeQueries({ queryKey: patientKeys.detail(deletedId) });
      
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (error) => {
      console.error(' Failed to delete patient:', error);
    },
  });
};

/**
 * Helper function to calculate age from date of birth
 * @param dobad - Date of birth in AD calendar
 * @param dobbs - Date of birth in BS calendar (unused)
 * @returns Age as string, returns '0' if invalid date
 */
function calculateAge(dobad: string, dobbs: string): string {
  if (!dobad) return '0';
  
  try {
    // Parse the date (assuming YYYY/MM/DD format)
    const birthDate = new Date(dobad);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  } catch {
    return '0';
  }
}

/**
 * Helper function to get district name from district ID
 * @param districtId - The district ID from API
 * @returns Human-readable district name
 */
function getDistrictName(districtId: string): string {
  const districtMap: { [key: string]: string } = {
    '45': 'Kathmandu',
    '46': 'Lalitpur',
    '47': 'Bhaktapur',
    // Add more district mappings as needed
  };
  return districtMap[districtId] || `District ${districtId}`;
}

/**
 * Helper function to get VDC/Municipality name from ID
 * @param vdcId - The VDC/Municipality ID from API
 * @returns Human-readable VDC/Municipality name
 */
function getVdcName(vdcId: string): string {
  const vdcMap: { [key: string]: string } = {
    '1147': 'Municipality A',
    '1148': 'Municipality B',
    // Add more VDC mappings as needed
  };
  return vdcMap[vdcId] || `VDC ${vdcId}`;
}

/**
 * Helper function to clean and format phone number for API submission
 * Removes country code, leading zeros, and non-digit characters
 * @param phone - Raw phone number input
 * @returns Cleaned phone number suitable for API
 */
function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  let cleanNumber = phone.replace(/\D/g, '');
  
  // If it starts with 977 (Nepal country code), remove it
  if (cleanNumber.startsWith('977')) {
    cleanNumber = cleanNumber.substring(3);
  }
  
  // If it starts with +977, the replace above would have handled it
  // If it starts with 0, remove the leading 0 (common in local format)
  if (cleanNumber.startsWith('0')) {
    cleanNumber = cleanNumber.substring(1);
  }
  
  return cleanNumber;
}