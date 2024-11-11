const db = require('./db');
const { promisify } = require('util');
const query = promisify(db.query).bind(db);

exports.fetchAccountInfo = async (req, res) => {
  const id_user = req.user?.id;

  if (!id_user) {
    return res.status(400).json({ message: 'User ID missing from request.' });
  }

  try {
    const sql = 'SELECT first_name, last_name, email, hire_date, position, salary ,is_admin FROM Users WHERE id = ?';
    const results = await query(sql, [id_user]);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No account information found for this user.' });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error(`Error fetching account information for user ${id_user}:`, err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
