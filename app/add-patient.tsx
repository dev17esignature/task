import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import FormDatePicker from "../components/form-date-picker";
import FormGender from "../components/form-gender";
import FormInput from "../components/form-input";
import FormPhoneInput from "../components/form-phone-input";
import FormSelect, { SelectOption } from "../components/form-select";
import Header from "../components/header";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { PatientFormData, createPatient, fetchPatients } from "../store/patientSlice";

/**
 * Form validation errors interface
 */
interface FormErrors {
  [key: string]: string;
}

/**
 * Validation rules for form fields
 */
const VALIDATION_RULES = {
  firstName: { required: true, message: "First name is required" },
  lastName: { required: true, message: "Last name is required" },
  gender: { required: true, message: "Gender is required" },
  age: { required: true, message: "Age is required" },
  dateOfBirth: { required: true, message: "Date of birth is required" },
  phone: { required: true, message: "Phone number is required" },
  relationship: { required: true, message: "Relationship is required" },
  district: { required: true, message: "District is required" },
  vdcMunicipality: { required: true, message: "VDC/Municipality is required" },
  wardNo: { required: true, message: "Ward number is required" },
  tole: { required: true, message: "Tole is required" },
  email: { 
    required: false, 
    message: "Please enter a valid email address",
    pattern: /\S+@\S+\.\S+/
  },
} as const;

export default function AddPatientScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.patients);

  // Form state management
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    year: "Years", // Default value
    dateOfBirth: "",
    email: "",
    phone: "",
    relationship: "",
    district: "",
    vdcMunicipality: "",
    wardNo: "",
    tole: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Memoized dropdown options for better performance
  const relationshipOptions: SelectOption[] = useMemo(() => [
    { label: "Spouse", value: "spouse" },
    { label: "Child", value: "child" },
    { label: "Parent", value: "parent" },
    { label: "Sibling", value: "sibling" },
    { label: "Grandparent", value: "grandparent" },
    { label: "Grandchild", value: "grandchild" },
    { label: "Other", value: "other" },
  ], []);

  const yearOptions: SelectOption[] = useMemo(() => [
    { label: "Years", value: "Years" },
    { label: "Months", value: "Months" },
    { label: "Days", value: "Days" },
  ], []);

  // Memoized district options (large array)
  const districtOptions: SelectOption[] = useMemo(() => [
    { label: "Kathmandu", value: "kathmandu" },
    { label: "Lalitpur", value: "lalitpur" },
    { label: "Bhaktapur", value: "bhaktapur" },
    { label: "Achham", value: "achham" },
    { label: "Arghakhanchi", value: "arghakhanchi" },
    { label: "Baglung", value: "baglung" },
    { label: "Baitadi", value: "baitadi" },
    { label: "Bajhang", value: "bajhang" },
    { label: "Bajura", value: "bajura" },
    { label: "Banke", value: "banke" },
    { label: "Bara", value: "bara" },
    { label: "Bardiya", value: "bardiya" },
    { label: "Bhojpur", value: "bhojpur" },
    { label: "Chitwan", value: "chitwan" },
    { label: "Dadeldhura", value: "dadeldhura" },
    { label: "Dailekh", value: "dailekh" },
    { label: "Dang", value: "dang" },
    { label: "Darchula", value: "darchula" },
    { label: "Dhading", value: "dhading" },
    { label: "Dhankuta", value: "dhankuta" },
    { label: "Dhanusa", value: "dhanusa" },
    { label: "Dolakha", value: "dolakha" },
    { label: "Dolpa", value: "dolpa" },
    { label: "Doti", value: "doti" },
    { label: "Gorkha", value: "gorkha" },
    { label: "Gulmi", value: "gulmi" },
    { label: "Humla", value: "humla" },
    { label: "Ilam", value: "ilam" },
    { label: "Jajarkot", value: "jajarkot" },
    { label: "Jhapa", value: "jhapa" },
    { label: "Jumla", value: "jumla" },
    { label: "Kailali", value: "kailali" },
    { label: "Kalikot", value: "kalikot" },
    { label: "Kanchanpur", value: "kanchanpur" },
    { label: "Kapilvastu", value: "kapilvastu" },
    { label: "Kaski", value: "kaski" },
    { label: "Kavrepalanchok", value: "kavrepalanchok" },
    { label: "Khotang", value: "khotang" },
    { label: "Lamjung", value: "lamjung" },
    { label: "Mahottari", value: "mahottari" },
    { label: "Makwanpur", value: "makwanpur" },
    { label: "Manang", value: "manang" },
    { label: "Morang", value: "morang" },
    { label: "Mugu", value: "mugu" },
    { label: "Mustang", value: "mustang" },
    { label: "Myagdi", value: "myagdi" },
    { label: "Nawalparasi", value: "nawalparasi" },
    { label: "Nuwakot", value: "nuwakot" },
    { label: "Okhaldhunga", value: "okhaldhunga" },
    { label: "Palpa", value: "palpa" },
    { label: "Panchthar", value: "panchthar" },
    { label: "Parbat", value: "parbat" },
    { label: "Parsa", value: "parsa" },
    { label: "Pyuthan", value: "pyuthan" },
    { label: "Ramechhap", value: "ramechhap" },
    { label: "Rasuwa", value: "rasuwa" },
    { label: "Rautahat", value: "rautahat" },
    { label: "Rolpa", value: "rolpa" },
    { label: "Rukum", value: "rukum" },
    { label: "Rupandehi", value: "rupandehi" },
    { label: "Salyan", value: "salyan" },
    { label: "Sankhuwasabha", value: "sankhuwasabha" },
    { label: "Saptari", value: "saptari" },
    { label: "Sarlahi", value: "sarlahi" },
    { label: "Sindhuli", value: "sindhuli" },
    { label: "Sindhupalchok", value: "sindhupalchok" },
    { label: "Siraha", value: "siraha" },
    { label: "Solukhumbu", value: "solukhumbu" },
    { label: "Sunsari", value: "sunsari" },
    { label: "Surkhet", value: "surkhet" },
    { label: "Syangja", value: "syangja" },
    { label: "Tanahu", value: "tanahu" },
    { label: "Taplejung", value: "taplejung" },
    { label: "Terhathum", value: "terhathum" },
    { label: "Udayapur", value: "udayapur" },
  ], []);

  const vdcMunicipalityOptions: SelectOption[] = useMemo(() => [
    { label: "Select Item", value: "" },
    { label: "Municipality A", value: "municipality_a" },
    { label: "Municipality B", value: "municipality_b" },
    { label: "VDC A", value: "vdc_a" },
    { label: "VDC B", value: "vdc_b" },
    { label: "VDC C", value: "vdc_c" },
  ], []);

  // Memoized form update handler to prevent unnecessary re-renders
  const updateFormData = useCallback((field: keyof PatientFormData, value: string) => {
    setFormData((prev: PatientFormData) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => ({
        ...prev,
        [field as string]: "",
      }));
    }
  }, [errors]);

  // Memoized validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    Object.entries(VALIDATION_RULES).forEach(([field, rule]) => {
      const value = formData[field as keyof PatientFormData];
      
      if (rule.required && (!value || !value.toString().trim())) {
        newErrors[field] = rule.message;
      } else if (field === 'email' && value && 'pattern' in rule && rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = rule.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Memoized success handler
  const handleSuccess = useCallback((response: any) => {
    Alert.alert(
      "Success",
      response.message || "Family member added successfully!",
      [
        {
          text: "OK",
          onPress: () => {
            // Refresh the patient list and navigate back
            dispatch(fetchPatients());
            navigation.goBack();
          },
        },
      ]
    );
  }, [dispatch, navigation]);

  // Memoized error handler
  const handleError = useCallback((error: any) => {
    const errorMessage = error?.message || "Failed to add family member. Please try again.";
    Alert.alert("Error", errorMessage, [{ text: "OK" }]);
  }, []);

  // Memoized submit handler
  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      dispatch(createPatient(formData))
        .unwrap()
        .then((response: any) => {
          if (response.type === "success") {
            handleSuccess(response);
          } else {
            handleError(response);
          }
        })
        .catch(handleError);
    }
  }, [formData, validateForm, dispatch, handleSuccess, handleError]);

  // Memoized form field handlers for performance
  const formHandlers = useMemo(() => ({
    firstName: (value: string) => updateFormData("firstName", value),
    lastName: (value: string) => updateFormData("lastName", value),
    gender: (value: string) => updateFormData("gender", value),
    age: (value: string) => updateFormData("age", value),
    year: (value: string) => updateFormData("year", value),
    dateOfBirth: (value: string) => updateFormData("dateOfBirth", value),
    email: (value: string) => updateFormData("email", value),
    phone: (value: string) => updateFormData("phone", value),
    relationship: (value: string) => updateFormData("relationship", value),
    district: (value: string) => updateFormData("district", value),
    vdcMunicipality: (value: string) => updateFormData("vdcMunicipality", value),
    wardNo: (value: string) => updateFormData("wardNo", value),
    tole: (value: string) => updateFormData("tole", value),
  }), [updateFormData]);

  return (
    <View style={styles.container}>
      <Header title="Add Family Member" />
      <ScrollView>
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChangeText={formHandlers.firstName}
                placeholder="Enter your first name..."
                required
                error={errors.firstName}
              />
            </View>
            <View style={styles.halfWidth}>
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={formHandlers.lastName}
                placeholder="Enter your last name..."
                required
                error={errors.lastName}
              />
            </View>
          </View>

          <FormGender
            label="Gender"
            value={formData.gender}
            onSelect={formHandlers.gender}
            required
            error={errors.gender}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormInput
                label="Age"
                value={formData.age}
                onChangeText={formHandlers.age}
                placeholder="Age"
                keyboardType="numeric"
                required
                error={errors.age}
              />
            </View>
            <View style={styles.halfWidth}>
              <FormSelect
                label="Year"
                options={yearOptions}
                value={formData.year}
                onSelect={formHandlers.year}
                placeholder="Year"
                error={errors.year}
              />
            </View>
          </View>

          <FormDatePicker
            label="Date of Birth"
            value={formData.dateOfBirth}
            onDateChange={formHandlers.dateOfBirth}
            placeholder="YYYY/MM/DD"
            required
            error={errors.dateOfBirth}
          />

          <FormInput
            label="Email Address"
            value={formData.email}
            onChangeText={formHandlers.email}
            placeholder="Enter email Address"
            keyboardType="email-address"
            error={errors.email}
          />

          <FormPhoneInput
            label="Phone Number"
            value={formData.phone}
            onPhoneChange={formHandlers.phone}
            placeholder="Phone Number"
            required
            error={errors.phone}
          />

          <FormSelect
            label="Relationship"
            options={relationshipOptions}
            value={formData.relationship}
            onSelect={formHandlers.relationship}
            placeholder="Select Relationship"
            required
            error={errors.relationship}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormSelect
                label="Select District"
                options={districtOptions}
                value={formData.district}
                onSelect={formHandlers.district}
                placeholder="Kathmandu"
                required
                error={errors.district}
              />
            </View>
            <View style={styles.halfWidth}>
              <FormSelect
                label="Select VDC/Municipality"
                options={vdcMunicipalityOptions}
                value={formData.vdcMunicipality}
                onSelect={formHandlers.vdcMunicipality}
                placeholder="Select Item"
                required
                error={errors.vdcMunicipality}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormInput
                label="Ward No"
                value={formData.wardNo}
                onChangeText={formHandlers.wardNo}
                placeholder="Ward"
                keyboardType="numeric"
                required
                error={errors.wardNo}
              />
            </View>
            <View style={styles.halfWidth}>
              <FormInput
                label="Tole"
                value={formData.tole}
                onChangeText={formHandlers.tole}
                placeholder="Tole"
                required
                error={errors.tole}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityLabel="Save patient information"
            accessibilityRole="button"
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  form: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  submitButton: {
    backgroundColor: "#008080",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
});
