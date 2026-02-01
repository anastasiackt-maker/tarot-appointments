const express = require('express');
const router = express.Router();
const supabase = require('../db'); // Теперь это клиент Supabase
const sendMail = require('../utils/mailer');

// Получение доступного времени
router.get('/available-times', async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: 'Дата не указана' });
    }

    const allSlots = ['10:00', '12:00', '14:00', '16:00', '18:00'];
    
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('time')
            .eq('date', date);

        if (error) throw error;

        const bookedSlots = data.map(slot => slot.time);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        res.json(availableSlots);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения времени' });
    }
});

// Создание новой записи
router.post('/', async (req, res) => {
    const { fullName, phone, telegram, email, date, time, request } = req.body;
    
    try {
        const { data, error } = await supabase
            .from('appointments')
            .insert([{ 
                full_name: fullName, 
                phone, 
                telegram_nick: telegram, 
                email, 
                date, 
                time, 
                detailed_request: request 
            }])
            .select();

        if (error) throw error;

        // Отправка уведомления админу
        const adminMailText = `Новая заявка на гадание!\n\nКлиент: ${fullName}\nТелефон: ${phone}\nДата: ${date}\nВремя: ${time}\nEmail: ${email}`;
        sendMail(process.env.ADMIN_EMAIL, 'Новая заявка на сайте', adminMailText);

        res.status(201).json({ message: 'Заявка успешно отправлена!', data: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании заявки' });
    }
});

module.exports = router;
