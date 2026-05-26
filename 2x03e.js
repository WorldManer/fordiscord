// 2x03e.js
(function() {
  const savedTheme = localStorage.getItem('fordis-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  const container = document.getElementById('avatarsContainer');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const randomBtn = document.getElementById('randomAvatarBtn');
  const randomPreview = document.getElementById('randomAvatarPreview');
  if (!container) return;

  let allAvatars = [];
  let loadedCount = 0;
  const batchSize = 10;
  let isLoading = false;

  function createAvatarCard(filename) {
    const card = document.createElement('div');
    card.className = 'avatar-card';

    const img = document.createElement('img');
    img.src = 'Assets/AvatarsFiles/' + filename;
    img.alt = filename;
    img.className = 'avatar-image';
    img.loading = 'lazy';

    img.onerror = function() {
      card.style.display = 'none';
    };

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

  function updateRandomPreview(filename) {
    randomPreview.innerHTML = '';
    const img = document.createElement('img');
    img.src = 'Assets/AvatarsFiles/' + filename;
    img.alt = filename;
    randomPreview.appendChild(img);
    
    randomPreview.onclick = function() {
      const link = document.createElement('a');
      link.href = 'Assets/AvatarsFiles/' + filename;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  function showRandomAvatar() {
    if (allAvatars.length === 0) return;
    const randomFile = allAvatars[Math.floor(Math.random() * allAvatars.length)];
    updateRandomPreview(randomFile);
  }

  function getFilename(avatar) {
    if (avatar.file.includes('.')) {
      return avatar.file;
    }
    return avatar.file + '.png';
  }

  function loadMore() {
    if (isLoading) return;
    if (loadedCount >= allAvatars.length) {
      loadMoreBtn.style.display = 'none';
      return;
    }
    
    isLoading = true;
    loadMoreBtn.style.display = 'none';
    
    const toLoad = allAvatars.slice(loadedCount, loadedCount + batchSize);
    const fragment = document.createDocumentFragment();
    
    toLoad.forEach(avatar => {
      const filename = getFilename(avatar);
      const card = createAvatarCard(filename);
      fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
    loadedCount += toLoad.length;
    
    if (loadedCount < allAvatars.length) {
      loadMoreBtn.style.display = 'block';
    }
    
    isLoading = false;
  }

  function handleScroll() {
    if (isLoading) return;
    if (loadedCount >= allAvatars.length) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollPosition >= documentHeight - 300) {
      loadMore();
    }
  }

  fetch('avatars.json')
    .then(response => response.json())
    .then(data => {
      const avatars = data.avatars;
      if (!avatars || avatars.length === 0) {
        container.innerHTML = '<p class="empty-message">Аватарки пока не добавлены.</p>';
        return;
      }

      allAvatars = avatars;
      loadMore();
      
      window.addEventListener('scroll', handleScroll);
    })
    .catch(error => {
      console.error('Ошибка загрузки avatars.json:', error);
      container.innerHTML = '<p class="empty-message">Не удалось загрузить аватарки.</p>';
    });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      loadMore();
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener('click', function() {
      showRandomAvatar();
    });
  }
})();
