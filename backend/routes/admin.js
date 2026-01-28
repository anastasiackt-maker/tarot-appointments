const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendMail } = require('../utils/mailer');

// Получить все записи
router.get('/appointments', (req, res) => {
  db.all(
    `SELECT * FROM appointments ORDER BY date ASC, time ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Подтвердить запись
router.post('/appointments/:id/confirm', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT * FROM appointments WHERE id = ?`,
    [id],
    (err, appt) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!appt) return res.status(404).json({ error: 'Not found' });

      db.run(
        `UPDATE appointments SET status = 'confirmed' WHERE id = ?`,
        [id],
        async (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          if (appt.email) {
            try {
              await sendMail({
                to: appt.email,
                subject: 'Подтверждение записи',
                text: `Ваша запись на гадание подтверждена: ${appt.date} в ${appt.time}`
              });
            } catch (e) {
              console.error(e);
            }
          }

          res.json({ success: true });
        }
      );
    }
  );
});

module.exports = router;
