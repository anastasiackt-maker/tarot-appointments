const apiBase = '/api';

const steps = ['step-1', 'step-2', 'step-3'];
let currentStep = 0;

function showStep(index) {
  steps.forEach((id, i) => {
    document.getElementById(id).classList.toggle('active', i === index);
  });
  currentStep = index;
}

document.getElementById('to-step-2').addEventListener('click', () => {
  const fullName = document.getElementById('full_name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if (!fullName || !phone) {
    alert('Заполните ФИО и телефон');
    return;
  }
  showStep(1);
});

document.getElementById('back-to-1').addEventListener('click', () => showStep(0));
document.getElementById('back-to-2').addEventListener('click', () => showStep(1));

document.getElementById('to-step-3').addEventListener('click', () => {
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  if (!date || !time) {
    alert('Выберите дату и время');
    return;
  }
  showStep(2);
});

document.getElementById('date').addEventListener('change', loadAvailableTimes);

function loadAvailableTimes() {
  const date = document.getElementById('date').value;
  const timeSelect = document.getElementById('time');
  timeSelect.innerHTML = '';

  if (!date) return;

  const allTimes = [
    '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00'
  ];

  fetch(`${apiBase}/appointments/slots?date=${encodeURIComponent(date)}`)
    .then(res => res.json())
    .then(data => {
      const taken = data.takenTimes || [];
      const available = allTimes.filter(t => !taken.includes(t));

      if (available.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Нет свободного времени';
        timeSelect.appendChild(opt);
        return;
      }

      available.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        timeSelect.appendChild(opt);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка загрузки времени');
    });
}

document.getElementById('submit').addEventListener('click', () => {
  const full_name = document.getElementById('full_name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const telegram_nick = document.getElementById('telegram_nick').value.trim();
  const email = document.getElementById('email').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const short_request = document.getElementById('short_request').value.trim();
  const detailed_request = document.getElementById('detailed_request').value.trim();

  if (!full_name || !phone || !date || !time) {
    alert('Проверьте обязательные поля');
    return;
  }

  fetch(`${apiBase}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name,
      phone,
      telegram_nick,
      email,
      date,
      time,
      short_request,
      detailed_request
    })
  })
    .then(res => res.json())
    .then(data => {
      const result = document.getElementById('result');
      if (data.error) {
        result.textContent = 'Ошибка: ' + data.error;
      } else {
        result.textContent = 'Заявка отправлена. Ожидайте подтверждения.';
      }
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка отправки');
    });
});
