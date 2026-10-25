

(function () {
  'use strict';


  const WEBHOOK_URL =
    'https://canary.discord.com/api/webhooks/1563918082647265340/1kSMa0d_UJvKbnnpprg2mt4Di5PeeA9xYrqz8JYJUwSJ4_bghdxuJnen9v445J7eEDt9';

  const form = document.getElementById('moderatorForm');
  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');
  const modal = document.getElementById('widgetModal');
  const modalClose = document.getElementById('modalClose');

  if (!form) return;



  function setStatus(text, type) {
    statusEl.textContent = text || '';
    statusEl.className = 'form-status' + (type ? ' ' + type : '');
  }

  function getRadioValue(name) {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '—';
  }

  function truncate(str, max) {
    if (!str) return '—';
    str = String(str).trim();
    if (!str) return '—';
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
  }

  function showModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) hideModal();
  });



  async function sendApplication(data) {
    const fields = [
      { name: '🎮 Ник в Discord', value: data.discordNick, inline: true },
      { name: '👤 Имя', value: data.realName, inline: true },
      { name: '🎂 Возраст', value: data.age, inline: true },
      { name: '⏳ Пользуется Discord', value: data.discordUsage, inline: true },
      { name: '🎤 Микрофон', value: data.microphone, inline: true },
      { name: '🗣️ Готов к собеседованию', value: data.interview, inline: true },
      { name: '📚 Опыт', value: truncate(data.experience, 1000) },
      { name: '🛠️ Что будет делать', value: truncate(data.duties, 1000) },
      { name: '💡 Почему именно он(а)', value: truncate(data.whyYou, 1000) },
    ];

    const payload = {
      username: 'ForDis • Заявки',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [
        {
          title: '📝 Новая заявка на модератора',
          color: 0x5865f2,
          fields: fields,
          footer: { text: 'ForDis • Система заявок' },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
  }


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('');


    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus('Пожалуйста, заполните все обязательные поля.', 'error');
      return;
    }

    const data = {
      discordNick: form.discordNick.value.trim(),
      realName: form.realName.value.trim(),
      age: form.age.value.trim(),
      discordUsage: form.discordUsage.value.trim(),
      experience: form.experience.value.trim(),
      duties: form.duties.value.trim(),
      whyYou: form.whyYou.value.trim(),
      microphone: getRadioValue('microphone'),
      interview: getRadioValue('interview'),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';
    setStatus('Отправка заявки…');

    try {
      await sendApplication(data);
      setStatus('Заявка успешно отправлена ✅', 'success');
      form.reset();
      showModal(); 
    } catch (err) {
      console.error('[ForDis] Ошибка отправки заявки:', err);
      setStatus('Не удалось отправить заявку. Попробуйте позже.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Подать заявку';
    }
  });
})();
