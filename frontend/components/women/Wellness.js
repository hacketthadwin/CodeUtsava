import { Text, View, TextInput, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';

// Color scheme derived from the user's Women Dashboard component
const COLORS = {
  primary: '#311B92', // Dark Indigo
  secondary: '#880E4F', // Dark Maroon
  tertiary: '#1B5E20', // Dark Forest Green
  danger: '#B71C1C', // Dark Red
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
  
  // Dummy data representing video content related to women's wellness
  const videoData = [
    { id: '1', title: 'Managing Menstrual Cramps', description: 'Expert advice on how to handle menstrual cramps and pain effectively.', color: COLORS.primary },
    { id: '2', title: 'Healthy Eating for Women', description: 'A guide to nutrition and diet plans for women\'s wellness.', color: COLORS.tertiary },
    { id: '3', title: 'Self-Defense Techniques', description: 'Essential self-defense moves for personal safety and empowerment.', color: COLORS.danger },
    { id: '4', title: 'Period Tracking Made Easy', description: 'Tips and tricks for using period tracking apps accurately.', color: COLORS.secondary },
    { id: '5', title: 'Mental Wellness & Stress', description: 'Techniques for managing stress and promoting mental health.', color: COLORS.primary },
    { id: '6', title: 'Yoga for Flexibility', description: 'A beginner\'s guide to yoga poses for flexibility and relaxation.', color: COLORS.tertiary },
    { id: '7', title: 'Emergency SOS Protocols', description: 'Learn what to do in emergency situations and access helplines.', color: COLORS.danger },
    { id: '8', title: 'Post-Pregnancy Recovery', description: 'Safe exercises and recovery methods for new mothers.', color: COLORS.secondary },
    { id: '9', title: 'Hormonal Balance', description: 'Understanding and regulating natural hormonal cycles.', color: COLORS.primary },
  ];

  // Simple filtering logic
  const filteredVideos = videoData.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.headerTitle}>Wellness Library</Text>
      <Text style={styles.headerSubtitle}>Discover curated videos on health topics.</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search videos (e.g., 'yoga' or 'cramps')..."
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
          <Text style={styles.noResultsText}>No videos found for your query. Try searching for broader terms like 'nutrition' or 'safety'.</Text>
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
