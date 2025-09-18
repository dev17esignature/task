import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from "react-native";

interface FormDatePickerProps {
  label: string;
  value?: string;
  onDateChange?: (date: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  format?: "YYYY/MM/DD" | "MM/DD/YYYY" | "DD/MM/YYYY";
}

export default function FormDatePicker({
  label,
  value,
  onDateChange,
  placeholder = "YYYY/MM/DD",
  error,
  required = false,
  format = "YYYY/MM/DD",
}: FormDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(
    value ? parseInt(value.split("/")[0]) : new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    value ? parseInt(value.split("/")[1]) : new Date().getMonth() + 1
  );
  const [selectedDay, setSelectedDay] = useState(
    value ? parseInt(value.split("/")[2]) : new Date().getDate()
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  const formatDateValue = (year: number, month: number, day: number) => {
    const paddedMonth = month.toString().padStart(2, "0");
    const paddedDay = day.toString().padStart(2, "0");
    
    switch (format) {
      case "MM/DD/YYYY":
        return `${paddedMonth}/${paddedDay}/${year}`;
      case "DD/MM/YYYY":
        return `${paddedDay}/${paddedMonth}/${year}`;
      case "YYYY/MM/DD":
      default:
        return `${year}/${paddedMonth}/${paddedDay}`;
    }
  };

  const handleConfirm = () => {
    const formattedDate = formatDateValue(selectedYear, selectedMonth, selectedDay);
    onDateChange?.(formattedDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity
        style={[styles.dateSelector, error && styles.dateSelectorError]}
        onPress={() => setShowPicker(true)}
      >
        <Text
          style={[
            styles.dateSelectorText,
            !value && styles.placeholderText,
          ]}
        >
          {value || placeholder}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmButton}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.pickerScroll}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedYear === year && styles.selectedPickerItemText,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.pickerScroll}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month.value && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMonth === month.value && styles.selectedPickerItemText,
                        ]}
                      >
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.pickerScroll}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedDay === day && styles.selectedPickerItemText,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
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
  dateSelector: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateSelectorError: {
    borderColor: "#ff4444",
    borderWidth: 2,
  },
  dateSelectorText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  calendarIcon: {
    fontSize: 16,
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
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  confirmButton: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "600",
  },
  pickerContainer: {
    flexDirection: "row",
    height: 300,
  },
  pickerColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  pickerLabel: {
    textAlign: "center",
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "#f5f5f5",
    color: "#333",
  },
  pickerScroll: {
    flex: 1,
  },
  pickerItem: {
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedPickerItem: {
    backgroundColor: "#e3f2fd",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedPickerItemText: {
    color: "#1976d2",
    fontWeight: "600",
  },
});