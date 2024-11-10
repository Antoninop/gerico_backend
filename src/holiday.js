const db = require('./db');
const { promisify } = require('util');

const query = promisify(db.query).bind(db);

exports.fetchHolidayInfo = async (req, res) => {
  const id_user = req.user?.id;

  // Validate that user ID exists
  if (!id_user) {
    return res.status(400).json({ message: 'User ID missing from request.' });
  }

  try {
    // Define SQL query to fetch remaining holidays
    const sql = 'SELECT remaining_holidays FROM Users WHERE id = ?';

    // Execute query and await the result
    const results = await query(sql, [id_user]);

    // Check if results were found
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No holiday information found for this user.' });
    }

    // Send response with holiday information
    res.status(200).json({ remaining_holidays: results[0].remaining_holidays });
  } catch (err) {
    console.error('Error fetching holiday information:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
