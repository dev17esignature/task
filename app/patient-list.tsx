import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../components/header";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Patient, fetchPatients } from "../store/patientSlice";

/**
 * Memoized Patient Item Component for better performance
 * Only re-renders when patient data or handlers change
 */
const PatientItem = React.memo(({ 
  patient, 
  onDelete, 
  onEdit,
  isDeleteLoading 
}: {
  patient: Patient;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  isDeleteLoading: boolean;
}) => (
  <View style={styles.patientCard}>
    <View style={styles.patientInfo}>
      <Text style={styles.patientName}>
        {patient.firstName} {patient.lastName}
      </Text>
      <View style={styles.patientDetails}>
        <Text style={styles.detailText}>
          Age: {patient.age} • Gender: {patient.gender}
        </Text>
        <Text style={styles.detailText}>
          Phone: {patient.phone}
        </Text>
        <Text style={styles.detailText}>
          Relationship: {patient.relationship}
        </Text>
        <Text style={styles.detailText}>
          Address: {patient.tole}, Ward {patient.wardNo}
        </Text>
      </View>
      <View style={styles.relationshipBadge}>
        <Text style={styles.relationshipText}>{patient.relationship}</Text>
      </View>
    </View>
    
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onDelete(patient.id)}
        disabled={isDeleteLoading}
      >
        <MaterialCommunityIcons name="delete" size={20} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onEdit(patient.id)}
      >
        <MaterialCommunityIcons name="pencil" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  </View>
));

PatientItem.displayName = 'PatientItem';

/**
 * Main Patient List Screen Component
 * Optimized with React performance best practices
 */
export default function PatientListScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  // Redux state with proper destructuring
  const { patients, loading, error } = useAppSelector((state) => state.patients);

  // Memoized patient count for performance
  const patientCount = useMemo(() => patients.length, [patients.length]);

  // Memoized sorted patients list
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => 
      a.firstName.localeCompare(b.firstName)
    );
  }, [patients]);

  // Fetch patients on component mount - using useCallback for stability
  const fetchPatientsData = useCallback(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  useEffect(() => {
    fetchPatientsData();
  }, [fetchPatientsData]);

  // Memoized delete handler to prevent unnecessary re-renders
  const handleDeletePatient = useCallback((patientId: string) => {
    // Alert.alert(
    //   "Delete Patient",
    //   "Are you sure you want to delete this patient?",
    //   [
    //     {
    //       text: "Cancel",
    //       style: "cancel",
    //     },
    //     {
    //       text: "Delete",
    //       style: "destructive",
    //       onPress: () => {
    //         dispatch(deletePatient(patientId));
    //       },
    //     },
    //   ]
    // );
  }, [dispatch]);

  // Memoized edit handler for performance
  const handleEditPatient = useCallback((patientId: string) => {
  //not available api
  }, []);

  // Memoized navigation handler
  const navigateToAddPatient = useCallback(() => {
    navigation.navigate("add-patient" as never);
  }, [navigation]);

  // Memoized key extractor for FlatList performance
  const keyExtractor = useCallback((item: Patient) => item.id, []);

  // Memoized render item function for FlatList
  const renderPatientItem = useCallback(({ item }: { item: Patient }) => (
    <PatientItem
      patient={item}
      onDelete={handleDeletePatient}
      onEdit={handleEditPatient}
      isDeleteLoading={loading}
    />
  ), [handleDeletePatient, handleEditPatient, loading]);

  // Memoized empty component for FlatList
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="account-group" size={48} color="#ccc" />
      <Text style={styles.emptyText}>No patients found</Text>
      <Text style={styles.emptySubText}>
        Add your first patient to get started
      </Text>
    </View>
  ), []);

  // Loading state
  if (loading && patientCount === 0) {
    return (
      <View style={styles.container}>
        <Header title="Patient List" />
        <View style={[styles.content, styles.centered]}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Patient List" />
        <View style={[styles.content, styles.centered]}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>
            Error loading patients
          </Text>
          <Text style={styles.errorSubText}>
            {error}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchPatientsData}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Patient List" />
      
      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Please select a patient for whom you want to take appointment for
        </Text>
        
        {patientCount > 0 && (
          <Text style={styles.countText}>
            {patientCount} patient{patientCount !== 1 ? 's' : ''} found
          </Text>
        )}
        
        <FlatList
          data={sortedPatients}
          renderItem={renderPatientItem}
          keyExtractor={keyExtractor}
          style={styles.patientList}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={(_, index) => ({
            length: 140,
            offset: 140 * index,
            index,
          })}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToAddPatient}
        accessibilityLabel="Add new patient"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Add Patient Button */}
      <TouchableOpacity
        style={styles.addPatientButton}
        onPress={navigateToAddPatient}
        accessibilityLabel="Add patient button"
        accessibilityRole="button"
      >
        <Text style={styles.addPatientButtonText}>Add Patient</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionText: {
    fontSize: 14,
    color: "#e74c3c",
    marginBottom: 16,
    textAlign: "left",
    lineHeight: 20,
  },
  patientList: {
    flex: 1,
  },
  patientCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  patientDetails: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  relationshipBadge: {
    backgroundColor: "#008080",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  relationshipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#008080",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addPatientButton: {
    backgroundColor: "#008080",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addPatientButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#008080",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  errorSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  countText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontWeight: "500",
  },
});