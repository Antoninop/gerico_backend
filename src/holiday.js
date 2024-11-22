const db = require('./db');
const { promisify } = require('util');
const { generateSmallID } = require('./utils');
const query = promisify(db.query).bind(db);
const { format } = require('date-fns'); 

exports.fetchHolidayInfo = async (req, res) => {
  const id_user = req.user?.id;

  if (!id_user) {
    return res.status(400).json({ message: 'User ID missing from request.' });
  }

  try {
    const sql = `
      SELECT 
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
      WHERE u.id = ?
      GROUP BY u.id
    `;

    const [result] = await query(sql, [id_user]);

    if (!result) {
      return res.status(404).json({ message: 'No holiday information found for this user.' });
    }

    const holidayInfo = JSON.parse(result.holidays || '[]').reduce(
      (acc, { state, denied, ...rest }) => {
        if (state === 0) acc.pending.push(rest);
        else if (state === 1) denied === 0 ? acc.approved.push(rest) : acc.denied.push(rest);
        return acc;
      },
      { pending: [], approved: [], denied: [] }
    );

    res.status(200).json({
      remaining_holidays: result.remaining_holidays,
      holidays: holidayInfo,
    });
  } catch (err) {
    console.error('Error fetching holiday information:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.askHoliday = async (req, res) => {
  const id_user = req.user?.id;
  const { length, date } = req.body;
  const id_holiday = generateSmallID();

  if (!id_user) {
    return res.status(400).json({ message: 'User ID missing from request.' });
  }

  try {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd'); 

    const sql = `
      INSERT INTO holiday (id_holiday, id_user, length, date)
      VALUES (?, ?, ?, ?)
    `;

    const userValues = [id_holiday, id_user, length, formattedDate];
    await query(sql, userValues); 

    res.status(200).json({ message: 'Holiday request submitted successfully.' });
  } catch (err) {
    console.error('Error processing holiday request:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
