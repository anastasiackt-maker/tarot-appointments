const express = require('express');
const router = express.Router();
const supabase = require('../db');
const sendMail = require('../utils/mailer');

// Получить все заявки
router.get('/appointments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false }); // Сортируем по дате создания

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения заявок' });
    }
});

// Подтвердить заявку
router.post('/appointments/:id/confirm', async (req, res) => {
    const { id } = req.params;
    try {
        // Сначала получаем данные заявки, чтобы узнать email клиента
        const { data: appointmentData, error: getError } = await supabase
            .from('appointments')
            .select('email, full_name, date, time')
            .eq('id', id)
            .single(); // .single() вернет один объект, а не массив

        if (getError) throw getError;
        if (!appointmentData) return res.status(404).json({ error: 'Заявка не найдена' });

        // Обновляем статус
        const { error: updateError } = await supabase
            .from('appointments')
            .update({ status: 'confirmed' })
            .eq('id', id);

        if (updateError) throw updateError;
        
        // Отправляем письмо-подтверждение клиенту
        const clientMailText = `Здравствуйте, ${appointmentData.full_name}!\n\nВаша запись на гадание ${appointmentData.date} в ${appointmentData.time} подтверждена.\n\nЖду вас!`;
        sendMail(appointmentData.email, 'Ваша запись на гадание Таро подтверждена', clientMailText);

        res.json({ message: 'Заявка подтверждена' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка подтверждения заявки' });
    }
});

module.exports = router;
