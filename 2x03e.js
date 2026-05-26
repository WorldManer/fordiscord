// 2x03e.js
(function() {
  const savedTheme = localStorage.getItem('fordis-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  const container = document.getElementById('avatarsContainer');
  const randomBtn = document.getElementById('randomAvatarBtn');
  const randomPreview = document.getElementById('randomAvatarPreview');
  if (!container) return;

  let allAvatars = [];

  function createAvatarCard(filename) {
    const card = document.createElement('div');
    card.className = 'avatar-card';

    const img = document.createElement('img');
    img.src = 'Assets/AvatarsFiles/' + filename;
    img.alt = filename;
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
      link.href = 'Assets/AvatarsFiles/' + filename;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    return card;
  }

  function showRandomAvatar() {
    if (allAvatars.length === 0) return;
    
    const randomFile = allAvatars[Math.floor(Math.random() * allAvatars.length)];
    
    randomPreview.innerHTML = '';
    const img = document.createElement('img');
    img.src = 'Assets/AvatarsFiles/' + randomFile;
    img.alt = randomFile;
    randomPreview.appendChild(img);
    
    randomPreview.onclick = function() {
      const link = document.createElement('a');
      link.href = 'Assets/AvatarsFiles/' + randomFile;
      link.download = randomFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  fetch('avatars.json')
    .then(response => response.json())
    .then(data => {
      const avatars = data.avatars;
      if (!avatars || avatars.length === 0) {
        container.innerHTML = '<p class="empty-message">Аватарки пока не добавлены.</p>';
        return;
      }

      allAvatars = avatars.map(avatar => avatar.file);

      avatars.forEach(avatar => {
        const card = createAvatarCard(avatar.file);
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Ошибка загрузки avatars.json:', error);
      container.innerHTML = '<p class="empty-message">Не удалось загрузить аватарки.</p>';
    });

  if (randomBtn) {
    randomBtn.addEventListener('click', function() {
      showRandomAvatar();
    });
  }
})();
