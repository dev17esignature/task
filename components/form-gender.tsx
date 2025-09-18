import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface GenderOption {
  label: string;
  value: string;
  icon: string;
}

interface FormGenderProps {
  label: string;
  value?: string;
  onSelect?: (value: string) => void;
  error?: string;
  required?: boolean;
}

const genderOptions: GenderOption[] = [
  { label: "Male", value: "male", icon: "♂️" },
  { label: "Female", value: "female", icon: "♀️" },
  { label: "Other", value: "other", icon: "⚧" },
];

export default function FormGender({
  label,
  value,
  onSelect,
  error,
  required = false,
}: FormGenderProps) {
  const handleSelect = (selectedValue: string) => {
    onSelect?.(selectedValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={styles.optionsContainer}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.selectedButton,
              error && !value && styles.errorButton,
            ]}
            onPress={() => handleSelect(option.value)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.selectedText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: 80,
    justifyContent: "center",
  },
  selectedButton: {
    borderColor: "#1976d2",
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
  },
  errorButton: {
    borderColor: "#ff4444",
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  selectedText: {
    color: "#1976d2",
    fontWeight: "600",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 4,
  },
});