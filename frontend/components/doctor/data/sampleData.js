export const patients = [
  {
    id: 1,
    name: 'Ramesh Kumar',
    age: 45,
    gender: 'Male',
    village: 'Dharampur',
    phone: '+91 98765 43210',
    medicalHistory: [
      'Diabetes Type 2 - Diagnosed 2020',
      'Hypertension - Under control',
      'Regular medication for blood pressure'
    ],
    lastVisit: '2025-09-28',
    nextAppointment: '2025-10-05',
    reports: [
      { id: 1, name: 'Blood Sugar Report', date: '2025-09-28', type: 'Lab Test' },
      { id: 2, name: 'BP Monitoring Chart', date: '2025-09-25', type: 'Vital Signs' }
    ]
  },
  {
    id: 2,
    name: 'Sunita Devi',
    age: 32,
    gender: 'Female',
    village: 'Ramgarh',
    phone: '+91 98765 43211',
    medicalHistory: [
      'Anemia - Under treatment',
      'Regular prenatal checkups',
      'Iron supplements prescribed'
    ],
    lastVisit: '2025-09-30',
    nextAppointment: '2025-10-08',
    reports: [
      { id: 3, name: 'Hemoglobin Test', date: '2025-09-30', type: 'Lab Test' },
      { id: 4, name: 'Prenatal Checkup', date: '2025-09-15', type: 'Checkup' }
    ]
  },
  {
    id: 3,
    name: 'Rajesh Sharma',
    age: 58,
    gender: 'Male',
    village: 'Dharampur',
    phone: '+91 98765 43212',
    medicalHistory: [
      'Arthritis - Ongoing treatment',
      'High cholesterol',
      'Previous knee surgery in 2018'
    ],
    lastVisit: '2025-09-27',
    nextAppointment: '2025-10-10',
    reports: [
      { id: 5, name: 'Cholesterol Test', date: '2025-09-27', type: 'Lab Test' },
      { id: 6, name: 'X-Ray Knee', date: '2025-09-20', type: 'Imaging' }
    ]
  },
  {
    id: 4,
    name: 'Kavita Patel',
    age: 28,
    gender: 'Female',
    village: 'Sitapur',
    phone: '+91 98765 43213',
    medicalHistory: [
      'Thyroid disorder - Controlled',
      'Regular thyroid medication',
      'Annual checkups required'
    ],
    lastVisit: '2025-09-29',
    nextAppointment: '2025-10-15',
    reports: [
      { id: 7, name: 'Thyroid Function Test', date: '2025-09-29', type: 'Lab Test' }
    ]
  },
  {
    id: 5,
    name: 'Mohan Singh',
    age: 65,
    gender: 'Male',
    village: 'Ramgarh',
    phone: '+91 98765 43214',
    medicalHistory: [
      'Asthma - Chronic condition',
      'Diabetes Type 2',
      'Uses inhaler regularly'
    ],
    lastVisit: '2025-10-01',
    nextAppointment: '2025-10-12',
    reports: [
      { id: 8, name: 'Respiratory Function Test', date: '2025-10-01', type: 'Lab Test' },
      { id: 9, name: 'Blood Sugar Report', date: '2025-10-01', type: 'Lab Test' }
    ]
  }
];

export const schedule = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Ramesh Kumar',
    time: '09:00 AM',
    duration: '30 mins',
    type: 'Follow-up',
    village: 'Dharampur'
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Sunita Devi',
    time: '10:00 AM',
    duration: '45 mins',
    type: 'Prenatal Checkup',
    village: 'Ramgarh'
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'Rajesh Sharma',
    time: '11:30 AM',
    duration: '30 mins',
    type: 'Follow-up',
    village: 'Dharampur'
  },
  {
    id: 4,
    patientId: 4,
    patientName: 'Kavita Patel',
    time: '02:00 PM',
    duration: '30 mins',
    type: 'Regular Checkup',
    village: 'Sitapur'
  },
  {
    id: 5,
    patientId: 5,
    patientName: 'Mohan Singh',
    time: '03:30 PM',
    duration: '45 mins',
    type: 'Respiratory Checkup',
    village: 'Ramgarh'
  }
];

export const ashaWorkers = [
  {
    id: 1,
    name: 'Priya Sharma',
    village: 'Dharampur',
    phone: '+91 98765 43220',
    patientsAssigned: 15
  },
  {
    id: 2,
    name: 'Rekha Devi',
    village: 'Ramgarh',
    phone: '+91 98765 43221',
    patientsAssigned: 12
  },
  {
    id: 3,
    name: 'Anita Kumari',
    village: 'Sitapur',
    phone: '+91 98765 43222',
    patientsAssigned: 18
  }
];

export const initialMessages = {
  asha: [
    {
      id: 1,
      senderId: 1,
      senderName: 'Priya Sharma',
      senderType: 'asha',
      text: 'Good morning Doctor! Ramesh Kumar needs his diabetes medication refill.',
      timestamp: new Date('2025-10-02T08:30:00'),
      read: true
    },
    {
      id: 2,
      senderId: 'doctor',
      senderName: 'Dr. Verma',
      senderType: 'doctor',
      text: 'Good morning Priya. I will check his latest reports and update the prescription today.',
      timestamp: new Date('2025-10-02T08:35:00'),
      read: true
    },
    {
      id: 3,
      senderId: 2,
      senderName: 'Rekha Devi',
      senderType: 'asha',
      text: 'Doctor, Sunita Devi is experiencing morning sickness. Should I bring her to the PHC?',
      timestamp: new Date('2025-10-02T09:15:00'),
      read: false
    }
  ],
  patients: [
    {
      id: 4,
      senderId: 3,
      senderName: 'Rajesh Sharma',
      senderType: 'patient',
      text: 'Doctor, my knee pain has increased. Can you suggest any exercises?',
      timestamp: new Date('2025-10-02T07:45:00'),
      read: true
    },
    {
      id: 5,
      senderId: 'doctor',
      senderName: 'Dr. Verma',
      senderType: 'doctor',
      text: 'Hello Rajesh. Please do gentle stretching exercises twice daily. Avoid heavy lifting. Come for a checkup if pain persists.',
      timestamp: new Date('2025-10-02T08:00:00'),
      read: true
    },
    {
      id: 6,
      senderId: 4,
      senderName: 'Kavita Patel',
      senderType: 'patient',
      text: 'Doctor, I forgot to take my thyroid medicine yesterday. What should I do?',
      timestamp: new Date('2025-10-02T09:30:00'),
      read: false
    }
  ]
};

export const notifications = [
  {
    id: 1,
    type: 'reminder',
    title: 'Upcoming Appointment',
    message: 'Ramesh Kumar - Follow-up at 09:00 AM today',
    timestamp: new Date('2025-10-02T08:00:00'),
    read: false,
    priority: 'high'
  },
  {
    id: 2,
    type: 'alert',
    title: 'New Message from ASHA',
    message: 'Rekha Devi sent you a message about Sunita Devi',
    timestamp: new Date('2025-10-02T09:15:00'),
    read: false,
    priority: 'medium'
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Medication Reminder',
    message: 'Send prescription reminder to Mohan Singh',
    timestamp: new Date('2025-10-02T08:30:00'),
    read: true,
    priority: 'medium'
  },
  {
    id: 4,
    type: 'update',
    title: 'Report Uploaded',
    message: 'New blood test report for Sunita Devi uploaded by ASHA worker',
    timestamp: new Date('2025-10-01T16:45:00'),
    read: true,
    priority: 'low'
  },
  {
    id: 5,
    type: 'reminder',
    title: 'Schedule Update',
    message: 'Your afternoon schedule starts at 02:00 PM with Kavita Patel',
    timestamp: new Date('2025-10-02T13:30:00'),
    read: false,
    priority: 'medium'
  }
];

export const aiChatResponses = {
  'diabetes': 'For Type 2 diabetes management: Monitor blood sugar regularly, maintain a balanced diet low in refined sugars, encourage regular physical activity (30 mins walking daily), ensure medication compliance, and schedule HbA1c tests every 3 months.',
  'hypertension': 'Hypertension management includes: Low sodium diet (less than 2g/day), regular BP monitoring, stress management, adequate sleep, medication compliance, and lifestyle modifications like regular exercise and weight management.',
  'pregnancy': 'Prenatal care guidelines: Regular checkups every 4 weeks until 28 weeks, then every 2 weeks until 36 weeks, then weekly. Monitor hemoglobin levels, ensure iron and folic acid supplementation, provide nutritional counseling, and screen for gestational diabetes.',
  'anemia': 'Anemia treatment: Iron-rich diet (green leafy vegetables, jaggery, dates), iron supplementation (typically 100mg elemental iron daily), vitamin C to enhance absorption, treat underlying causes, and recheck hemoglobin after 4-6 weeks.',
  'asthma': 'Asthma management: Identify and avoid triggers, ensure proper inhaler technique, use controller medications regularly, keep rescue inhaler accessible, monitor peak flow, and educate about warning signs of severe attacks.',
  'default': 'I can help you with medical queries related to common conditions like diabetes, hypertension, pregnancy care, anemia, asthma, and general primary care. Please ask specific questions about patient symptoms or treatment protocols.'
};
