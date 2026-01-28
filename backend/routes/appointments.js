const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendMail } = require('../utils/mailer');

// Получить занятые слоты на дату
router.get('/slots', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required' });

  db.all(
    `SELECT time FROM appointments WHERE date = ?`,
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const takenTimes = rows.map(r => r.time);
      res.json({ takenTimes });
    }
  );
});

// Создать новую запись
router.post('/', (req, res) => {
  const {
    full_name,
    phone,
    telegram_nick,
    date,
    time,
    short_request,
    detailed_request,
    email
  } = req.body;

  if (!full_name || !phone || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Проверяем, не занят ли уже слот
  db.get(
    `SELECT id FROM appointments WHERE date = ? AND time = ?`,
    [date, time],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) {
        return res.status(409).json({ error: 'Slot already taken' });
      }

      db.run(
        `
        INSERT INTO appointments (
          full_name, phone, telegram_nick, date, time,
          short_request, detailed_request, email, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `,
        [
          full_name,
          phone,
          telegram_nick,
          date,
          time,
          short_request,
          detailed_request,
          email || null
        ],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          const appointmentId = this.lastID;

          // Уведомление админу
          if (process.env.ADMIN_EMAIL) {
            sendMail({
              to: process.env.ADMIN_EMAIL,
              subject: 'Новая запись на гадание',
              text: `Новая запись #${appointmentId} от ${full_name} на ${date} ${time}`
            }).catch(console.error);
          }

          res.json({ success: true, id: appointmentId });
        }
      );
    }
  );
});

module.exports = router;