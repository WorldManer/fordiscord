// 2x03e.js
(function() {
  const savedTheme = localStorage.getItem('fordis-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  const container = document.getElementById('avatarsContainer');
  if (!container) return;

  fetch('avatars.json')
    .then(response => response.json())
    .then(data => {
      const avatars = data.avatars;
      if (!avatars || avatars.length === 0) {
        container.innerHTML = '<p class="empty-message">Аватарки пока не добавлены.</p>';
        return;
      }

      avatars.forEach(avatar => {
        const card = document.createElement('div');
        card.className = 'avatar-card';

        const img = document.createElement('img');
        img.src = 'Assets/AvatarsFiles/' + avatar.file;
        img.alt = avatar.file;
        img.className = 'avatar-image';
        img.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'avatar-overlay';

        const downloadText = document.createElement('span');
        downloadText.className = 'download-text';
        downloadText.textContent = 'Установка';

        overlay.appendChild(downloadText);
        card.appendChild(img);
        card.appendChild(overlay);
        
        card.addEventListener('click', function() {
          const link = document.createElement('a');
          link.href = 'Assets/AvatarsFiles/' + avatar.file;
          link.download = avatar.file;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });

        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Ошибка загрузки avatars.json:', error);
      container.innerHTML = '<p class="empty-message">Не удалось загрузить аватарки.</p>';
    });
})();
