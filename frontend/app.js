document.addEventListener('DOMContentLoaded', () => {

    // --- НАЧАЛО НОВОГО КОДА ДЛЯ ПЕРЕКЛЮЧЕНИЯ ШАГОВ ---
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');

    const toStep2Btn = document.getElementById('to-step-2');
    const toStep3Btn = document.getElementById('to-step-3');
    const backTo1Btn = document.getElementById('back-to-1');
    const backTo2Btn = document.getElementById('back-to-2');

    // Проверяем, что все кнопки существуют, чтобы не было ошибок на странице админки
    if (toStep2Btn) {
        toStep2Btn.addEventListener('click', () => {
            // Простая проверка, что основные поля на шаге 1 заполнены
            const fullName = document.getElementById('full_name').value;
            const phone = document.getElementById('phone').value;
            if (!fullName || !phone) {
                alert('Пожалуйста, заполните ФИО и телефон.');
                return;
            }
            step1.classList.remove('active');
            step2.classList.add('active');
        });
    }

    if (backTo1Btn) {
        backTo1Btn.addEventListener('click', () => {
            step2.classList.remove('active');
            step1.classList.add('active');
        });
    }

    if (toStep3Btn) {
        toStep3Btn.addEventListener('click', () => {
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            if (!date || !time) {
                alert('Пожалуйста, выберите дату и время.');
                return;
            }
            step2.classList.remove('active');
            step3.classList.add('active');
        });
    }

    if (backTo2Btn) {
        backTo2Btn.addEventListener('click', () => {
            step3.classList.remove('active');
            step2.classList.add('active');
        });
    }
    // --- КОНЕЦ НОВОГО КОДА ---


    // Этот код выполняется, только если мы находимся на главной странице (index.html)
    if (document.getElementById('appointment-form')) {
        const form = document.getElementById('appointment-form');
        const dateInput = document.getElementById('date');
        const timeSelect = document.getElementById('time');

        // Функция для загрузки доступного времени с сервера
        const loadAvailableTimes = () => {
            const date = dateInput.value;
            timeSelect.innerHTML = '<option value="">-- Выберите время --</option>';
            if (!date) return;

            fetch(`/api/appointments/available-times?date=${date}`)
                .then(response => {
                    if (!response.ok) throw new Error('Сетевая ошибка при загрузке времени');
                    return response.json();
                })
                .then(availableSlots => {
                    if (availableSlots.length === 0) {
                        const option = new Option('На эту дату всё занято', '', true, true);
                        option.disabled = true;
                        timeSelect.add(option);
                    } else {
                        availableSlots.forEach(slot => {
                            timeSelect.add(new Option(slot, slot));
                        });
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки доступного времени:', error);
                    const option = new Option('Ошибка загрузки', '', true, true);
                    option.disabled = true;
                    timeSelect.add(option);
                });
        };

        // Функция для отправки данных формы
        const handleFormSubmit = (event) => {
            event.preventDefault(); // Предотвращаем стандартную отправку формы

            const formData = {
                fullName: document.getElementById('full_name').value,
                phone: document.getElementById('phone').value,
                telegram: document.getElementById('telegram_nick').value,
                email: document.getElementById('email').value,
                date: dateInput.value,
                time: timeSelect.value,
                // Важная поправка: у вас было два разных ID для запроса. Используем оба
                short_request: document.getElementById('short_request').value,
                detailed_request: document.getElementById('detailed_request').value,
            };

            // Проверка на последнем шаге
            if (!formData.short_request && !formData.detailed_request) {
                alert('Пожалуйста, опишите ваш запрос.');
                return;
            }

            fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Ошибка: ${data.error}`);
                } else {
                    alert('Ваша заявка успешно отправлена! Ожидайте подтверждения по email.');
                    form.reset(); // Очищаем форму
                    // Возвращаемся на первый шаг
                    step3.classList.remove('active');
                    step1.classList.add('active');
                }
            })
            .catch(error => {
                console.error('Ошибка при отправке заявки:', error);
                alert('Произошла ошибка при отправке заявки. Попробуйте снова.');
            });
        };

        // Навешиваем обработчики событий
        dateInput.addEventListener('change', loadAvailableTimes);
        form.addEventListener('submit', handleFormSubmit);
        dateInput.min = new Date().toISOString().split("T")[0];
    }

    // Этот код выполняется, только если мы на странице админки (admin.html)
    if (document.getElementById('admin-table')) {
        const tableBody = document.querySelector('#admin-table tbody');

        const loadAppointments = () => {
            tableBody.innerHTML = '<tr><td colspan="7">Загрузка заявок...</td></tr>';
            fetch('/api/admin/appointments')
                .then(response => response.json())
                .then(data => {
                    tableBody.innerHTML = '';
                    if (data.error) throw new Error(data.error);
                    if (data.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="7">Новых заявок нет.</td></tr>';
                    } else {
                        data.forEach(app => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${app.full_name}</td>
                                <td>${app.phone}<br>${app.telegram || ''}<br>${app.email || ''}</td>
                                <td>${new Date(app.date).toLocaleDateString()} в ${app.time}</td>
                                <td>${app.short_request || ''}<hr>${app.detailed_request || ''}</td>
                                <td class="${app.status === 'confirmed' ? 'status-confirmed' : ''}">${app.status === 'pending' ? 'Ожидает' : 'Подтверждена'}</td>
                                <td>
                                    ${app.status === 'pending' ? `<button class="confirm-btn" data-id="${app.id}">Подтвердить</button>` : ''}
                                    <button class="delete-btn" data-id="${app.id}">Удалить</button>
                                </td>
                            `;
                            tableBody.appendChild(row);
                        });
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки заявок:', error);
                    tableBody.innerHTML = `<tr><td colspan="7">Ошибка загрузки заявок: ${error.message}</td></tr>`;
                });
        };

        const confirmAppointment = (id) => {
            fetch(`/api/admin/appointments/${id}/confirm`, { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.error) alert(`Ошибка: ${data.error}`);
                    else alert(data.message);
                    loadAppointments();
                })
                .catch(error => {
                    console.error('Ошибка подтверждения:', error);
                    alert('Произошла ошибка при подтверждении.');
                });
        };

        const deleteAppointment = (id) => {
            fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.error) alert(`Ошибка: ${data.error}`);
                    else alert(data.message);
                    loadAppointments();
                })
                .catch(error => {
                    console.error('Ошибка удаления:', error);
                    alert('Произошла ошибка при удалении.');
                });
        };

        tableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('confirm-btn')) {
                const id = event.target.dataset.id;
                if (confirm('Вы уверены, что хотите подтвердить эту запись?')) {
                    confirmAppointment(id);
                }
            }
            if (event.target.classList.contains('delete-btn')) {
                const id = event.target.dataset.id;
                if (confirm('Вы уверены, что хотите УДАЛИТЬ эту запись? Это действие необратимо.')) {
                    deleteAppointment(id);
                }
            }
        });

        loadAppointments();
    }
});
