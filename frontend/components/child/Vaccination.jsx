import { Alert, Text, TouchableOpacity, View, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';

// Reusing the color scheme for consistency
const COLORS = {
  primary: '#311B92',   // Primary/Action Color
  secondary: '#FFC107', // Yellow for 'Due Today'
  tertiary: '#1B5E20',   // Green for 'Given'
  danger: '#B71C1C',     // Red for 'Overdue'
  darkBlue: '#0047AB', // Used for 'Upcoming'
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
};

// --- DATA & HELPER FUNCTIONS ---

// Sample vaccination schedule based on typical infant vaccines (simplified)
const today = new Date();
const format = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// Assume baby's date of birth (DOB) is 6 months ago for relevant data
const DOB = addDays(today, -180); 

const vaccinationSchedule = [
  // Vaccine 1: Birth Dose
  { id: 'v1', name: 'BCG/Hepatitis B (Birth)', dueDate: format(DOB), status: 'Given', givenDate: format(DOB) },
  // Vaccine 2: 6 Weeks
  { id: 'v2', name: 'Rotavirus 1 / DTaP 1', dueDate: format(addDays(DOB, 42)), status: 'Given', givenDate: format(addDays(DOB, 45)) },
  // Vaccine 3: 10 Weeks
  { id: 'v3', name: 'DTaP 2 / Hib 2', dueDate: format(addDays(DOB, 70)), status: 'Given', givenDate: format(addDays(DOB, 72)) },
  // Vaccine 4: 14 Weeks
  { id: 'v4', name: 'Rotavirus 3 / DTaP 3', dueDate: format(addDays(DOB, 98)), status: 'Given', givenDate: format(addDays(DOB, 100)) },
  // Vaccine 5: 6 Months (Should be Upcoming or Due soon)
  { id: 'v5', name: 'Influenza 1', dueDate: format(addDays(DOB, 180)), status: 'Upcoming', givenDate: null },
  // Vaccine 6: 9 Months (Future)
  { id: 'v6', name: 'Measles/Mumps/Rubella (MMR)', dueDate: format(addDays(DOB, 270)), status: 'Upcoming', givenDate: null },
];

/**
 * This reliably calculates the display status and color based on the full vaccine object.
 */
const getDisplayStatus = (vaccine) => {
  if (vaccine.status === 'Given') {
    return { status: 'Given', color: COLORS.tertiary };
  }

  const dueDate = new Date(vaccine.dueDate);
  const now = new Date();
  
  // Set time to midnight for accurate date comparison
  now.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < now) {
    return { status: 'Overdue', color: COLORS.danger };
  } else if (dueDate.getTime() === now.getTime()) {
    return { status: 'Due Today', color: COLORS.secondary };
  } else {
    return { status: 'Upcoming', color: COLORS.darkBlue };
  }
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


// --- MONTH/YEAR PICKER COMPONENT (Reused with minimal changes) ---

const YearMonthPicker = ({ selectedMonth, selectedYear, onSelect, onClose }) => {
  const [localMonth, setLocalMonth] = useState(selectedMonth);
  const [localYear, setLocalYear] = useState(selectedYear);
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(y);
  }

  const handleDone = () => {
    onSelect(localMonth, localYear);
    onClose();
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
                onPress={() => setLocalMonth(index)}
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
                onPress={() => setLocalYear(year)}
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

const Vaccination = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push({ key: `empty-${i}`, day: '' });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = format(new Date(currentYear, currentMonth, i));
      // Find all vaccines due or given on this day
      const vaccines = vaccinationSchedule.filter(v => v.dueDate === dateString || v.givenDate === dateString);
      
      calendarDays.push({ 
        key: `day-${i}`, 
        day: i, 
        dateString: dateString,
        vaccines: vaccines,
      });
    }

    return calendarDays;
  };

  const handleDayPress = (dayItem) => {
    if (!dayItem.day) return;

    const date = `${MONTHS[currentMonth]} ${dayItem.day}, ${currentYear}`;
    
    // FIX 3: Use optional chaining to safely check for vaccines
    if (dayItem.vaccines?.length > 0) {
      const vaccineList = dayItem.vaccines.map(v => 
        `- ${v.name} (${v.status === 'Given' ? 'Given' : 'Due/Upcoming'})`
      ).join('\n');

      Alert.alert(
        `Vaccination Schedule for ${date}`,
        `Vaccines on this day:\n${vaccineList}`
      );
    } else {
      Alert.alert(
        "No Vaccines Scheduled",
        `No vaccines are due or recorded for ${date}.`
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

  const handleDateSelection = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Infant Vaccination Tracker</Text>
      <Text style={styles.headerSubtitle}>Manage your baby's immunizations.</Text>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* --- VACCINATION STATUS LIST --- */}
        <Text style={styles.sectionTitle}>Immunization Status</Text>
        {vaccinationSchedule.map(v => {
          const { status, color } = getDisplayStatus(v);
          return (
            <View key={v.id} style={styles.cycleCard}>
              <View style={styles.cycleInfo}>
                <Text style={styles.vaccineName}>{v.name}</Text>
                <Text style={styles.vaccineDate}>Due: {v.dueDate}</Text>
                {v.givenDate && <Text style={styles.vaccineDate}>Given: {v.givenDate}</Text>}
              </View>
              <View style={styles.cycleStatusContainer}>
                <Text style={[styles.vaccineStatus, { color: color, borderColor: color }]}>{status}</Text>
              </View>
            </View>
          );
        })}

        {/* --- INTERACTIVE CALENDAR --- */}
        <Text style={styles.sectionTitle}>Calendar View</Text>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Text style={styles.navButton}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsPickerVisible(true)}>
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
            
            // FIX 1: Safely check for vaccines using optional chaining
            const hasVaccine = item.vaccines?.length > 0;
            
            let dotColor = null;

            if (hasVaccine) {
                // FIX 2: Safely access the first vaccine using optional chaining
                const { color } = getDisplayStatus(item.vaccines?.[0]);
                dotColor = color; 
            }

            return (
              <TouchableOpacity 
                key={item.key} 
                style={[styles.dayCell, isToday && { borderWidth: 2, borderColor: COLORS.primary }]}
                onPress={() => item.day && handleDayPress(item)}
              >
                <Text style={[styles.dayText, isToday && styles.todayText]}>{item.day}</Text>
                {/* Highlight dot for vaccine days */}
                {dotColor && <View style={[styles.vaccineDot, { backgroundColor: dotColor }]} />}
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

// --- STYLES (Adjusted for Vaccination) ---

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
  // --- Status Card Styles ---
  cycleCard: { // Renamed for styling consistency
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
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  vaccineDate: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  cycleStatusContainer: {
    alignItems: 'flex-end',
  },
  vaccineStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
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
    color: COLORS.primary, // Changed from darkBlue to primary for contrast
  },
  vaccineDot: { // Changed from todayDot
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 5,
  },
});

// --- PICKER STYLES (Used by YearMonthPicker - Unchanged but included for completeness) ---
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
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearItem: {
    width: '48%',
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
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '30%',
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

export default Vaccination;
