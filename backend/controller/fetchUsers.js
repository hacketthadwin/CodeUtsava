const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    console.log('Received request with query:', req.query);
    const { role } = req.query;
    console.log('Extracted role:', role);

    // Only allow doctors for now
    const validRoles = ['Doctor'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Default to Doctor role if none specified
    const query = { role: role || 'Doctor' };
    console.log('Constructed query:', query);

    const users = await User.find(query).select('name role');
    console.log('Raw query result count:', users.length);
    console.log('Query result (with _id):', users);

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No doctors found',
        data: [],
        count: 0,
      });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
