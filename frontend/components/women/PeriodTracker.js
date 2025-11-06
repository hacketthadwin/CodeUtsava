import { Alert, Text, TouchableOpacity, View, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Reusing the color scheme for consistency
const COLORS = {
  primary: '#311B92', 
  secondary: '#880E4F', 
  tertiary: '#1B5E20', // Green for 'Normal'
  danger: '#B71C1C',   // Red for 'Abnormal'
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
};

// --- DATA & HELPER FUNCTIONS ---
const pastPeriods = [
  { id: 'p1', startDate: '2025-09-15', endDate: '2025-09-21', duration: 7 },
  { id: 'p2', startDate: '2025-08-18', endDate: '2025-08-22', duration: 5 },
  { id: 'p3', startDate: '2025-07-20', endDate: '2025-07-27', duration: 8 }, 
  { id: 'p4', startDate: '2025-06-25', endDate: '2025-06-29', duration: 5 },
];

const isNormalDuration = (days) => days >= 3 && days <= 7;
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- MONTH/YEAR PICKER COMPONENT ---
const YearMonthPicker = ({ selectedMonth, selectedYear, onSelect, onClose }) => {
  // Use internal state to track selection within the picker
  const [localMonth, setLocalMonth] = useState(selectedMonth);
  const [localYear, setLocalYear] = useState(selectedYear);
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(y);
  }

  const handleYearSelect = (year) => {
    setLocalYear(year); // Update local state, do not close the modal
  };

  const handleMonthSelect = (monthIndex) => {
    setLocalMonth(monthIndex); // Update local state, do not close the modal
  };

  const handleDone = () => {
    onSelect(localMonth, localYear); // Pass final selection back to parent
    onClose(); // Then close the modal
  };

  return (
    <View style={pickerStyles.overlay}>
      <View style={pickerStyles.modalContainer}>
        <Text style={pickerStyles.pickerTitle}>Jump to Date</Text>
        
        <ScrollView style={pickerStyles.scrollView}>
          {/* --- Month Selection (List) --- */}
          <Text style={pickerStyles.sectionTitle}>Select Month</Text>
          <View style={pickerStyles.monthGrid}>
            {MONTHS.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  pickerStyles.monthItem,
                  localMonth === index && pickerStyles.selectedItem,
                ]}
                onPress={() => handleMonthSelect(index)}
              >
                <Text style={[
                  pickerStyles.monthText,
                  localMonth === index && pickerStyles.selectedText,
                ]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* --- Year Selection (2 Columns) --- */}
          <Text style={pickerStyles.sectionTitle}>Select Year</Text>
          <View style={pickerStyles.yearGrid}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  pickerStyles.yearItem,
                  localYear === year && pickerStyles.selectedItem,
                ]}
                onPress={() => handleYearSelect(year)}
              >
                <Text style={[
                  pickerStyles.yearText,
                  localYear === year && pickerStyles.selectedText,
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <TouchableOpacity style={pickerStyles.closeButton} onPress={handleDone}>
          <Text style={pickerStyles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- MAIN COMPONENT ---

const PeriodTracker = () => {
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const today = new Date();

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push({ key: `empty-${i}`, day: '' });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({ key: `day-${i}`, day: i });
    }

    return calendarDays;
  };

  const handleDayPress = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    
    if (selectedDate > today) {
      Alert.alert(
        "Not Available",
        "Period data is not available for future months."
      );
      return;
    }

    const periodInMonth = pastPeriods.find(p => {
      const pStart = new Date(p.startDate);
      return pStart.getFullYear() === currentYear && pStart.getMonth() === currentMonth;
    });

    if (periodInMonth) {
      Alert.alert(
        "Period Details",
        `Started: ${periodInMonth.startDate}\nLasted: ${periodInMonth.duration} days\nEnded: ${periodInMonth.endDate}`
      );
    } else {
      Alert.alert(
        "No Data",
        "No period recorded for this month."
      );
    }
  };

  const changeMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleMonthYearPress = () => {
    setIsPickerVisible(true);
  };
  
  const handleDateSelection = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    // Modal is now closed by the handleDone() function in the picker itself
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Period Tracker</Text>
      <Text style={styles.headerSubtitle}>Track your cycles and health.</Text>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* --- RECENT CYCLES LIST --- */}
        <Text style={styles.sectionTitle}>Recent Cycles</Text>
        {pastPeriods.map(p => {
          const status = isNormalDuration(p.duration) ? 'Normal' : 'Abnormal';
          const statusColor = isNormalDuration(p.duration) ? COLORS.tertiary : COLORS.danger;
          return (
            <View key={p.id} style={styles.cycleCard}>
              <View style={styles.cycleInfo}>
                <Text style={styles.cycleDates}>Start: {p.startDate}</Text>
                <Text style={styles.cycleDates}>End: {p.endDate}</Text>
              </View>
              <View style={styles.cycleStatusContainer}>
                <Text style={styles.cycleDuration}>{p.duration} days</Text>
                <Text style={[styles.cycleStatus, { color: statusColor }]}>{status}</Text>
              </View>
            </View>
          );
        })}

        {/* --- INTERACTIVE CALENDAR --- */}
        <Text style={styles.sectionTitle}>Calendar</Text>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Text style={styles.navButton}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMonthYearPress}>
            <Text style={styles.currentMonthYear}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Text style={styles.navButton}>{">"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdaysContainer}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {generateCalendar().map((item) => {
            const isToday = item.day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            return (
              <TouchableOpacity 
                key={item.key} 
                style={styles.dayCell}
                onPress={() => item.day && handleDayPress(item.day)}
              >
                <Text style={[styles.dayText, isToday && styles.todayText]}>{item.day}</Text>
                {isToday && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* --- MONTH/YEAR PICKER MODAL --- */}
      {isPickerVisible && (
        <YearMonthPicker
          selectedMonth={currentMonth}
          selectedYear={currentYear}
          onSelect={handleDateSelection}
          onClose={() => setIsPickerVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 60,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  sectionTitle: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  // --- Cycle Card Styles ---
  cycleCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cycleInfo: {
    flexDirection: 'column',
  },
  cycleDates: {
    fontSize: 14,
    color: COLORS.black,
  },
  cycleStatusContainer: {
    alignItems: 'flex-end',
  },
  cycleDuration: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  cycleStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  // --- Calendar Styles ---
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    fontSize: 24,
    color: COLORS.darkBlue,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  currentMonthYear: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: COLORS.black,
  },
  todayText: {
    fontWeight: 'bold',
    color: COLORS.darkBlue,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.darkBlue,
    position: 'absolute',
    bottom: 5,
  },
});

// --- PICKER STYLES (Used by YearMonthPicker) ---
const pickerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  pickerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    paddingBottom: 5,
  },
  // Year Grid: 2 columns
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearItem: {
    width: '48%', // Ensures 2 columns with spacing
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
  },
  yearText: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '500',
  },
  // Month Grid: 3 columns (or list, but let's keep it clean list here)
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '30%', // Roughly 3 columns
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '500',
  },
  // Selected Styles
  selectedItem: {
    backgroundColor: COLORS.darkBlue,
  },
  selectedText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PeriodTracker;