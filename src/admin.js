const db = require('./db');
const { promisify } = require('util');
const query = promisify(db.query).bind(db);


exports.fetchArchivedUsers = async (req, res) => {
  const id_user = req.user?.id;

  if (!id_user) {
    return res.status(400).json({ message: 'User ID missing from request.' });
  }

  try {
    const sql = 'SELECT first_name, last_name, email, hire_date, position, remaining_holidays, is_admin FROM Users WHERE archived = 1';    
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
    const sql = 'SELECT first_name, last_name, email, hire_date, position,is_admin,remaining_holidays FROM Users WHERE archived = 0';    
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

  exports.fetchAskedHoliday = async (req, res) => {
    try {
      const sql = `
        SELECT 
          u.id AS user_id,
          u.first_name,
          u.last_name,
          u.remaining_holidays,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'state', h.state,
              'denied', h.denied,
              'date', h.date,
              'length', h.length
            )
          ) AS holidays
        FROM Users u
        LEFT JOIN holiday h ON u.id = h.id_user
        GROUP BY u.id
      `;
  
      const results = await query(sql);
  
      if (!results || results.length === 0) {
        return res.status(404).json({ message: 'No holiday information found' });
      }
  
      const users = results.map(user => {
        const holidays = JSON.parse(user.holidays || '[]').reduce(
          (acc, { state, denied, ...rest }) => {
            if (state === 0) acc.pending.push(rest);
            else if (state === 1) denied === 0 ? acc.approved.push(rest) : acc.denied.push(rest);
            return acc;
          },
          { pending: [], approved: [], denied: [] }
        );
  
        return {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          remaining_holidays: user.remaining_holidays,
          holidays,
        };
      });
  
      res.status(200).json({ users });
    } catch (err) {
      console.error('Error fetching holiday information:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  