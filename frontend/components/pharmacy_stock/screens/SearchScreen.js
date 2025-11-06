import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import { COLORS, getStockColor } from '../utils/colors';

export default function SearchScreen() {
  const { medicines } = usePharmacy();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterLocation, setFilterLocation] = useState('all');
  const [simulatedLocation, setSimulatedLocation] = useState(null);

  const bgColor = COLORS.white;
  const textColor = COLORS.black;
  const cardBg = COLORS.gray;

  const locations = useMemo(() => {
    const locs = new Set(medicines.map(m => m.location));
    return ['all', ...Array.from(locs)];
  }, [medicines]);

  const handleNearMe = () => {
    const availableLocations = Array.from(new Set(medicines.map(m => m.location)));
    const randomLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)];
    setSimulatedLocation(randomLocation);
    setFilterLocation(randomLocation);
  };

  const filteredAndSortedMedicines = useMemo(() => {
    let filtered = medicines.filter(med => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        med.medicine.toLowerCase().includes(query) ||
        med.pharmacy.toLowerCase().includes(query) ||
        med.location.toLowerCase().includes(query) ||
        med.batch.toLowerCase().includes(query);
      
      const matchesLocation = filterLocation === 'all' || med.location === filterLocation;
      
      return matchesSearch && matchesLocation;
    });

    if (sortBy === 'expiry') {
      filtered.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    } else if (sortBy === 'quantity') {
      filtered.sort((a, b) => a.quantity - b.quantity);
    } else {
      filtered.sort((a, b) => a.medicine.localeCompare(b.medicine));
    }

    return filtered;
  }, [medicines, searchQuery, sortBy, filterLocation]);

  const renderMedicineItem = ({ item }) => {
    const stockColor = getStockColor(item.quantity, item.expiry);
    const expiryDate = new Date(item.expiry);
    const isExpired = expiryDate < new Date();

    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={[styles.stockIndicator, { backgroundColor: stockColor }]} />
        <View style={styles.cardContent}>
          <Text style={[styles.medicineName, { color: textColor }]}>{item.medicine}</Text>
          <Text style={[styles.pharmacyName, { color: textColor }]}>{item.pharmacy}</Text>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>Batch: {item.batch}</Text>
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
            <Text style={[styles.cardLabel, { color: textColor }]}>Price: {item.price}</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={12} color={textColor} />
            <Text style={[styles.cardLabel, { color: textColor, marginLeft: 4 }]}>
              {item.location}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Search & Filter</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor, borderColor: textColor }]}
          placeholder="Search medicines, pharmacy, location..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={styles.nearMeButton}
          onPress={handleNearMe}
        >
          <Ionicons name="navigate" size={20} color={COLORS.white} />
          <Text style={styles.nearMeText}>Find Pharmacies Near Me</Text>
          {simulatedLocation && (
            <Text style={styles.nearMeSubtext}>(Simulated: {simulatedLocation})</Text>
          )}
        </TouchableOpacity>

        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: textColor }]}>Sort By:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortBy === 'name' && styles.activeFilter,
              ]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[styles.filterButtonText, sortBy === 'name' && styles.activeFilterText]}>
                Name
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortBy === 'expiry' && styles.activeFilter,
              ]}
              onPress={() => setSortBy('expiry')}
            >
              <Text style={[styles.filterButtonText, sortBy === 'expiry' && styles.activeFilterText]}>
                Expiry
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortBy === 'quantity' && styles.activeFilter,
              ]}
              onPress={() => setSortBy('quantity')}
            >
              <Text style={[styles.filterButtonText, sortBy === 'quantity' && styles.activeFilterText]}>
                Quantity
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: textColor }]}>Location:</Text>
          <View style={styles.filterButtons}>
            {locations.map(loc => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.filterButton,
                  filterLocation === loc && styles.activeFilter,
                ]}
                onPress={() => {
                  setFilterLocation(loc);
                  if (loc === 'all') setSimulatedLocation(null);
                }}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterLocation === loc && styles.activeFilterText
                ]}>
                  {loc === 'all' ? 'All' : loc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsText, { color: textColor }]}>
          {filteredAndSortedMedicines.length} results found
        </Text>
      </View>

      <FlatList
        data={filteredAndSortedMedicines}
        renderItem={renderMedicineItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={COLORS.gray} />
            <Text style={[styles.emptyText, { color: textColor }]}>No medicines found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  nearMeButton: {
    backgroundColor: COLORS.darkBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  nearMeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  nearMeSubtext: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 4,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.black,
  },
  activeFilterText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  cardValue: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.6,
  },
});
