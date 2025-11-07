import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
 
const AdminPanel = () => {
  // 🔹 Hardcoded initial users
  const [users, setUsers] = useState([
    { id: '1', name: 'Adarsh', email: 'adarsh@gmail.com', role: 'admin', password: 'admin123' },
    { id: '2', name: 'Dr. Adarsh Mukund Jha', email: 'adarsh123456678jha@gmail.com', role: 'doctor', password: 'docbob' },
    { id: '3', name: 'Aryan', email: 'a@g.com', role: 'patient', password: 'charlie1' },
    { id: '4', name: 'Krrish', email: 'krish@gmail.com', role: 'patient', password: 'diana2' },
  ]);
 
  const [showPasswords, setShowPasswords] = useState({});
  const [newDoctor, setNewDoctor] = useState({ name: '', email: '', password: '' });
 
  // 🔹 Add a doctor
  const addDoctor = () => {
    if (!newDoctor.name || !newDoctor.email || !newDoctor.password) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }
    const newUser = {
      id: Date.now().toString(),
      ...newDoctor,
      role: 'doctor',
    };
    setUsers((prev) => [...prev, newUser]);
    setNewDoctor({ name: '', email: '', password: '' });
    Alert.alert('Success', `Doctor ${newDoctor.name} added!`);
  };
 
  // 🔹 Password toggle
  const togglePassword = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };
 
  const mask = (str) => {
    if (!str) return '';
    if (str.length <= 2) return '*'.repeat(str.length);
    return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
  };
 
  // 🔹 Group users
  const admins = users.filter((u) => u.role === 'admin');
  const doctors = users.filter((u) => u.role === 'doctor');
  const patients = users.filter((u) => u.role === 'patient');
 
  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>{item.role}</Text>
      </View>
      <Text style={styles.small}>Email: {item.email}</Text>
      <View style={styles.credRow}>
        <Text style={styles.small}>Password: </Text>
        <Text style={styles.password}>
          {showPasswords[item.id] ? item.password : mask(item.password)}
        </Text>
        <TouchableOpacity onPress={() => togglePassword(item.id)} style={styles.showBtn}>
          <Text style={styles.showBtnText}>{showPasswords[item.id] ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏥 Admin Panel</Text>
      <Text style={styles.subtitle}>Welcome, Alice Admin</Text>
 
      {/* 🔹 Add Doctor Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>➕ Add Doctor</Text>
        <TextInput
          placeholder="Doctor Name"
          value={newDoctor.name}
          onChangeText={(t) => setNewDoctor({ ...newDoctor, name: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Doctor Email"
          value={newDoctor.email}
          onChangeText={(t) => setNewDoctor({ ...newDoctor, email: t })}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={newDoctor.password}
          onChangeText={(t) => setNewDoctor({ ...newDoctor, password: t })}
          style={styles.input}
          secureTextEntry
        />
        <TouchableOpacity onPress={addDoctor} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add Doctor</Text>
        </TouchableOpacity>
      </View>
 
      {/* 🔹 Admin Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Credentials</Text>
        <FlatList
          data={admins}
          renderItem={renderUser}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
        />
      </View>
 
      {/* 🔹 Doctors List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Doctors ({doctors.length})</Text>
        <FlatList
          data={doctors}
          renderItem={renderUser}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
        />
      </View>
 
      {/* 🔹 Patients List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patients ({patients.length})</Text>
        <FlatList
          data={patients}
          renderItem={renderUser}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};
 
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1E3A8A',
  },
  subtitle: {
    color: '#4B5563',
    marginBottom: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1E40AF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  userCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: '500',
    fontSize: 15,
  },
  role: {
    fontSize: 13,
    color: '#6B7280',
  },
  small: {
    fontSize: 13,
    color: '#374151',
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  password: {
    fontFamily: 'monospace',
    color: '#111827',
  },
  showBtn: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E0E7FF',
    borderRadius: 6,
  },
  showBtnText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
});
 
export default AdminPanel;