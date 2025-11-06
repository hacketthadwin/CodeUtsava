import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import { COLORS, getStockColor } from '../utils/colors';

export default function DashboardScreen() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = usePharmacy();
  const [viewMode, setViewMode] = useState('list');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    pharmacy: '',
    medicine: '',
    batch: '',
    quantity: '',
    expiry: '',
    price: '',
    location: '',
  });

  const bgColor = COLORS.white;
  const textColor = COLORS.black;
  const cardBg = COLORS.gray;

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      pharmacy: '',
      medicine: '',
      batch: '',
      quantity: '',
      expiry: '',
      price: '',
      location: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      pharmacy: medicine.pharmacy,
      medicine: medicine.medicine,
      batch: medicine.batch,
      quantity: medicine.quantity.toString(),
      expiry: medicine.expiry,
      price: medicine.price,
      location: medicine.location,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.medicine || !formData.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const medicineData = {
      ...formData,
      quantity: parseInt(formData.quantity),
    };

    if (editingMedicine) {
      updateMedicine(editingMedicine.id, medicineData);
    } else {
      addMedicine(medicineData);
    }

    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteMedicine(id), style: 'destructive' },
      ]
    );
  };

  const renderMedicineCard = ({ item }) => {
    const stockColor = getStockColor(item.quantity, item.expiry);
    const expiryDate = new Date(item.expiry);
    const isExpired = expiryDate < new Date();

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }]}
        onPress={() => openEditModal(item)}
      >
        <View style={[styles.stockIndicator, { backgroundColor: stockColor }]} />
        <View style={styles.cardContent}>
          <Text style={[styles.medicineName, { color: textColor }]}>{item.medicine}</Text>
          <Text style={[styles.pharmacyName, { color: textColor }]}>{item.pharmacy}</Text>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>Batch: </Text>
            <Text style={[styles.cardValue, { color: textColor }]}>{item.batch}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>Quantity: </Text>
            <Text style={[styles.cardValue, { color: stockColor, fontWeight: 'bold' }]}>
              {item.quantity}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>Expiry: </Text>
            <Text style={[styles.cardValue, { color: isExpired ? COLORS.danger : textColor }]}>
              {item.expiry}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>Price: </Text>
            <Text style={[styles.cardValue, { color: textColor }]}>{item.price}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>Location: </Text>
            <Text style={[styles.cardValue, { color: textColor }]}>{item.location}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Pharmacy Stock</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <Ionicons
              name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
              size={24}
              color={textColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={medicines}
        renderItem={renderMedicineCard}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
            </Text>
            <ScrollView style={styles.formContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholder="Medicine Name *"
                placeholderTextColor="#999"
                value={formData.medicine}
                onChangeText={(text) => setFormData({ ...formData, medicine: text })}
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholder="Pharmacy Name"
                placeholderTextColor="#999"
                value={formData.pharmacy}
                onChangeText={(text) => setFormData({ ...formData, pharmacy: text })}
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholder="Batch Number"
                placeholderTextColor="#999"
                value={formData.batch}
                onChangeText={(text) => setFormData({ ...formData, batch: text })}
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholder="Quantity *"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholder="Expiry Date (YYYY-MM-DD)"
                placeholderTextColor="#999"
                value={formData.expiry}
                onChangeText={(text) => setFormData({ ...formData, expiry: text })}
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholder="Price (e.g., ₹12/strip)"
                placeholderTextColor="#999"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholder="Location"
                placeholderTextColor="#999"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flex: 1,
    margin: 4,
    position: 'relative',
  },
  stockIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    marginLeft: 10,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pharmacyName: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  cardRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  cardLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  cardValue: {
    fontSize: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
