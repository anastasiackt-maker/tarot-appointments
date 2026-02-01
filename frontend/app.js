// Этот код выполняется, только если мы находимся на главной странице (index.html)
if (document.getElementById('appointment-form')) {
    
    // Находим нужные элементы на странице
    const form = document.getElementById('appointment-form');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');

    // Функция для загрузки доступного времени с сервера
    const loadAvailableTimes = () => {
        const date = dateInput.value;
        
        // Очищаем старые варианты времени
        timeSelect.innerHTML = '<option value="">-- Выберите время --</option>';
        if (!date) return;

        // Отправляем запрос на наш API, чтобы узнать занятые слоты
        // Путь '/api/appointments/available-times' будет перенаправлен Netlify на нашу функцию
        fetch(`/api/appointments/available-times?date=${date}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Сетевая ошибка при загрузке времени');
                }
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

        // Собираем данные из полей формы
        const formData = {
            fullName: document.getElementById('full_name').value,
            phone: document.getElementById('phone').value,
            telegram: document.getElementById('telegram_nick').value,
            email: document.getElementById('email').value,
            date: dateInput.value,
            time: timeSelect.value,
            request: document.getElementById('request').value,
        };

        // Отправляем данные на наш API
        fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(`Ошибка: ${data.error}`);
            } else {
                alert('Ваша заявка успешно отправлена! Ожидайте подтверждения по email.');
                form.reset(); // Очищаем форму
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

    // Устанавливаем минимальную дату для выбора - сегодня
    dateInput.min = new Date().toISOString().split("T")[0];
}


// Этот код выполняется, только если мы на странице админки (admin.html)
if (document.getElementById('admin-table')) {

    const tableBody = document.querySelector('#admin-table tbody');

    // Функция для загрузки всех заявок
    const loadAppointments = () => {
        tableBody.innerHTML = '<tr><td colspan="7">Загрузка заявок...</td></tr>';

        fetch('/api/admin/appointments')
            .then(response => response.json())
            .then(data => {
                tableBody.innerHTML = ''; // Очищаем таблицу перед заполнением
                if (data.error) {
                    throw new Error(data.error);
                }
                if (data.length === 0) {
                     tableBody.innerHTML = '<tr><td colspan="7">Новых заявок нет.</td></tr>';
                } else {
                    data.forEach(app => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${app.full_name}</td>
                            <td>${app.phone}<br>${app.email || ''}</td>
                            <td>${new Date(app.date).toLocaleDateString()} в ${app.time}</td>
                            <td>${app.detailed_request || 'Нет'}</td>
                            <td class="${app.status === 'confirmed' ? 'status-confirmed' : ''}">${app.status === 'pending' ? 'Ожидает' : 'Подтверждена'}</td>
                            <td>
                                ${app.status === 'pending' ? `<button class="confirm-btn" data-id="${app.id}">Подтвердить</button>` : ''}
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

    // Функция для подтверждения заявки
    const confirmAppointment = (id) => {
        fetch(`/api/admin/appointments/${id}/confirm`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Ошибка: ${data.error}`);
                } else {
                    alert(data.message);
                    loadAppointments(); // Перезагружаем список заявок
                }
            })
            .catch(error => {
                console.error('Ошибка подтверждения:', error);
                alert('Произошла ошибка при подтверждении.');
            });
    };
    
    // Обработка кликов на кнопки "Подтвердить"
    tableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('confirm-btn')) {
            const id = event.target.dataset.id;
            if (confirm('Вы уверены, что хотите подтвердить эту запись?')) {
                confirmAppointment(id);
            }
        }
    });

    // Загружаем заявки при первой загрузке страницы
    loadAppointments();
}
