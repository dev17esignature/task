import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface CountryCode {
  code: string;
  country: string;
  dialCode: string;
  flag: string;
}

interface FormPhoneInputProps {
  label: string;
  value?: string;
  onPhoneChange?: (phone: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  defaultCountry?: string;
}

const countryCodes: CountryCode[] = [
  { code: "NP", country: "Nepal", dialCode: "+977", flag: "🇳🇵" },
  { code: "US", country: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", country: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "IN", country: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "CA", country: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", country: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", country: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", country: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "JP", country: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "CN", country: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "BR", country: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "MX", country: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "RU", country: "Russia", dialCode: "+7", flag: "🇷🇺" },
  { code: "IT", country: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", country: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "KR", country: "South Korea", dialCode: "+82", flag: "🇰🇷" },
];

export default function FormPhoneInput({
  label,
  value,
  onPhoneChange,
  placeholder = "Phone Number",
  error,
  required = false,
  defaultCountry = "NP",
}: FormPhoneInputProps) {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    countryCodes.find((c) => c.code === defaultCountry) || countryCodes[0]
  );
  const [phoneNumber, setPhoneNumber] = useState(
    value ? value.replace(selectedCountry.dialCode, "").trim() : ""
  );

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    
    // Only send the phone number without country code
    onPhoneChange?.(phoneNumber);
  };

  const handlePhoneNumberChange = (number: string) => {
    // Remove any non-numeric characters except spaces and dashes
    const cleanNumber = number.replace(/[^\d\s\-]/g, "");
    setPhoneNumber(cleanNumber);
    
    // Send only the phone number without country code
    onPhoneChange?.(cleanNumber);
  };

  const renderCountryItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.country}</Text>
        <Text style={styles.countryDialCode}>{item.dialCode}</Text>
      </View>
      {selectedCountry.code === item.code && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={[styles.phoneContainer, error && styles.phoneContainerError]}>
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.flagText}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCodeText}>{selectedCountry.dialCode}</Text>
          <Text style={styles.arrowDown}>▼</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder={placeholder}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={countryCodes}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              style={styles.countryList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  required: {
    color: "#ff4444",
  },
  phoneContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  phoneContainerError: {
    borderColor: "#ff4444",
    borderWidth: 2,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#eee",
    minWidth: 100,
  },
  flagText: {
    fontSize: 18,
    marginRight: 8,
  },
  dialCodeText: {
    fontSize: 16,
    color: "#333",
    marginRight: 4,
    flex: 1,
  },
  arrowDown: {
    fontSize: 10,
    color: "#666",
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  countryDialCode: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: "#1976d2",
    fontWeight: "600",
  },
});