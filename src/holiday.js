const db = require('./db');
const { promisify } = require('util');

const query = promisify(db.query).bind(db);

exports.fetchHolidayInfo = async (req, res) => {
  const id_user = req.user?.id;

  if (!id_user) {
    return res.status(400).json({ message: 'User ID missing from request.' });
  }

  try {
    const sql = 'SELECT remaining_holidays FROM Users WHERE id = ?';
    const results = await query(sql, [id_user]);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No holiday information found for this user.' });
    }

    res.status(200).json({ remaining_holidays: results[0].remaining_holidays });
  } catch (err) {
    console.error('Error fetching holiday information:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
