import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Chip, List, Avatar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { patients } from '../data/sampleData';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const allReports = patients.flatMap(patient => 
    patient.reports.map(report => ({
      ...report,
      patientName: patient.name,
      patientId: patient.id,
      village: patient.village
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredReports = allReports.filter(report =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconForReportType = (type) => {
    switch(type) {
      case 'Lab Test':
        return 'test-tube';
      case 'Imaging':
        return 'x-ray';
      case 'Vital Signs':
        return 'heart-pulse';
      case 'Checkup':
        return 'clipboard-pulse';
      default:
        return 'file-document';
    }
  };

  const getColorForReportType = (type) => {
    switch(type) {
      case 'Lab Test':
        return '#2196F3';
      case 'Imaging':
        return '#9C27B0';
      case 'Vital Signs':
        return '#F44336';
      case 'Checkup':
        return '#4CAF50';
      default:
        return '#6200ee';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Searchbar
        placeholder="Search reports..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={40} icon="file-document" style={styles.statIcon} />
            <View>
              <Title style={styles.statNumber}>{allReports.length}</Title>
              <Paragraph style={styles.statLabel}>Total Reports</Paragraph>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={40} icon="calendar-today" style={styles.statIcon} />
            <View>
              <Title style={styles.statNumber}>
                {allReports.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
              </Title>
              <Paragraph style={styles.statLabel}>Today's Reports</Paragraph>
            </View>
          </Card.Content>
        </Card>
      </View>

      <Title style={styles.sectionTitle}>All Reports</Title>

      <ScrollView>
        {filteredReports.map((report) => (
          <Card key={`${report.patientId}-${report.id}`} style={styles.reportCard}>
            <Card.Content>
              <View style={styles.reportHeader}>
                <Avatar.Icon 
                  size={48} 
                  icon={getIconForReportType(report.type)}
                  style={[styles.reportIcon, { backgroundColor: getColorForReportType(report.type) }]}
                />
                <View style={styles.reportInfo}>
                  <Title style={styles.reportTitle}>{report.name}</Title>
                  <Paragraph style={styles.patientName}>{report.patientName}</Paragraph>
                  <View style={styles.reportMeta}>
                    <Chip mode="outlined" style={styles.typeChip} textStyle={styles.chipText}>
                      {report.type}
                    </Chip>
                    <Paragraph style={styles.dateText}>{report.date}</Paragraph>
                  </View>
                </View>
              </View>
              <List.Item
                title="Village"
                description={report.village}
                left={props => <List.Icon {...props} icon="map-marker" />}
                style={styles.listItem}
              />
            </Card.Content>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <View style={styles.emptyContainer}>
            <Avatar.Icon size={64} icon="file-document-outline" style={styles.emptyIcon} />
            <Paragraph style={styles.emptyText}>No reports found</Paragraph>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    backgroundColor: '#6200ee',
    marginRight: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  sectionTitle: {
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  reportCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reportIcon: {
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  listItem: {
    paddingLeft: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyIcon: {
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
