import { Text, View, TextInput, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';

// Color scheme derived from the user's Women Dashboard component
const COLORS = {
  primary: '#311B92', // Dark Indigo (Development/Learning)
  secondary: '#880E4F', // Dark Maroon (Safety/First Aid / Mental Health)
  tertiary: '#1B5E20', // Dark Forest Green (Nutrition/Health)
  danger: '#B71C1C', // Dark Red (Safety/First Aid / Mental Health)
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB', // Light grey for search input background
};

// Component to represent a single video tile (one video per row)
const VideoTile = ({ title, description, color }) => (
  <View style={[styles.videoTile, { backgroundColor: color }]}>
    <Text style={styles.videoTitle}>{title}</Text>
    <Text style={styles.videoDescription}>{description}</Text>
  </View>
);

const WellnessPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Updated dummy data representing video content related to CHILD wellness, nutrition, and development
  const videoData = [
    { id: '1', title: 'Infant Solid Food Introduction', description: 'Expert guide on when and how to safely introduce solid foods to your baby.', color: COLORS.tertiary },
    { id: '2', title: 'Toddler Sleep Training Tips', description: 'Gentle techniques for establishing a healthy, consistent sleep routine for toddlers.', color: COLORS.primary },
    { id: '3', title: 'Baby First Aid: Choking', description: 'Essential, step-by-step instructions for handling infant choking emergencies.', color: COLORS.danger },
    { id: '4', title: 'Understanding Developmental Milestones', description: 'What to expect in the first year: sitting, crawling, and first words.', color: COLORS.primary },
    { id: '5', title: 'Balanced Meals for Picky Eaters', description: 'Creative strategies and recipes to ensure your child gets proper nutrition.', color: COLORS.tertiary },
    
    // --- NEW CARD 1: Newborn/Feeding Focus ---
    { id: '10', title: 'Lactation & Feeding Support', description: 'Tips from experts on successful latching, milk supply, and formula safety.', color: COLORS.secondary },
    
    // --- NEW CARD 2: Caregiver Mental Health Focus ---
    { id: '11', title: 'Postpartum Parental Mental Health', description: 'Recognizing signs of PPD/PPA and finding resources for caregiver emotional well-being.', color: COLORS.danger },
    
    { id: '6', title: 'Managing Fever and Pain in Infants', description: 'When to worry and how to safely administer medication for common childhood discomforts.', color: COLORS.secondary },
    { id: '7', title: 'Safe Home Environment Setup', description: 'Child-proofing checklist for kitchens, stairs, and play areas.', color: COLORS.danger },
    { id: '8', title: 'Tummy Time & Motor Skills', description: 'Fun ways to encourage tummy time to build crucial motor skills and strength.', color: COLORS.primary },
    { id: '9', title: 'Post-Vaccination Care', description: 'Tips for soothing your child and managing minor side effects after immunizations.', color: COLORS.tertiary },
  ];

  // Simple filtering logic
  const filteredVideos = videoData.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.headerTitle}>Child Wellness Library</Text>
      <Text style={styles.headerSubtitle}>Curated videos on child health, safety, and development.</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search topics (e.g., 'sleep', 'solids', 'safety')..."
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Scrollable Content: Video Tiles */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <VideoTile 
              key={video.id}
              title={video.title}
              description={video.description}
              color={video.color}
            />
          ))
        ) : (
          <Text style={styles.noResultsText}>No videos found for your query. Try searching for broader terms like 'nutrition' or 'development'.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 60,
  },
  headerTitle: {
    color: COLORS.black,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  videoTile: {
    width: '100%',
    height: 120,
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  videoTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoDescription: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 5,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888888',
    paddingHorizontal: 20,
  },
});

export default WellnessPage;
