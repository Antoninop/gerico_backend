const db = require('./db');
const { promisify } = require('util');
const query = promisify(db.query).bind(db);


exports.fetchArchivedUsers = async (req, res) => {
  const id_user = req.user?.id;

  if (!id_user) {
    return res.status(400).json({ message: 'User ID missing from request.' });
  }

  try {
    const sql = 'SELECT first_name, last_name, email, hire_date, position, salary, is_admin FROM Users WHERE archived = 1';    
    const results = await query(sql);
    if (!results || results.length === 0) {
      return res.status(200).json({ message: 'No archived users found.' });
    }
    res.status(200).json(results);
  } catch (err) {
    console.error(`Error fetching archived users:`, err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




exports.fetchUsers = async (req, res) => {
  const id_user = req.user?.id;

  if (!id_user) {
    return res.status(400).json({ message: 'User ID missing from request.' });
  }

  try {
    const sql = 'SELECT first_name, last_name, email, hire_date, position, salary, is_admin FROM Users WHERE archived = 0';    
    const results = await query(sql);
    if (!results || results.length === 0) {
      return res.status(200).json({ message: 'No  users found.' });
    }
    res.status(200).json(results);
  } catch (err) {
    console.error(`Error fetching users:`, err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

  

  exports.fetchHolidaysRequest = async (req, res) => {
    const id_user = req.user?.id;
  
    if (!id_user) {
      return res.status(400).json({ message: 'User ID missing from request.' });
    }
  
    try {
      const sql = 'SELECT id_user, date, created_at, length, date FROM Users WHERE state = 0 and denied = 0';
      const results = await query(sql, [id_user]);
  
      if (!results || results.length === 0) {
        return res.status(200).json({ message: 'No holiday information found' });
      }
  
      res.status(200).json(results);
    } catch (err) {
      console.error(`Error fetching holiday request:`, err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  