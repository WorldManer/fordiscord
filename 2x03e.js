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
  let preloadedImages = new Set();

  function getFilename(avatar) {
    if (avatar.file.includes('.')) {
      return avatar.file;
    }
    return avatar.file + '.png';
  }

  // Быстрая предзагрузка изображения
  function preloadImageFast(src, priority = false) {
    if (preloadedImages.has(src)) return Promise.resolve(src);
    
    return new Promise((resolve) => {
      const img = new Image();
      if (priority) {
        // Высокий приоритет для первых изображений
        img.fetchPriority = 'high';
      }
      img.onload = () => {
        preloadedImages.add(src);
        resolve(src);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function preloadFirstBatch(avatars, count = 10) {
    const promises = avatars.slice(0, count).map(avatar => {
      const primaryFile = getFilename(avatar);
      const src = 'Assets/AvatarsFiles/' + primaryFile;
      return preloadImageFast(src, true);
    });
    await Promise.all(promises);
  }

  function createAvatarCard(avatar, isPriority = false) {
    const card = document.createElement('div');
    card.className = 'avatar-card';

    const img = document.createElement('img');
    const primaryFile = getFilename(avatar);
    const src = 'Assets/AvatarsFiles/' + primaryFile;
    
    img.className = 'avatar-image';
    img.loading = isPriority ? 'eager' : 'lazy';
    
    if (isPriority && 'decode' in img) {
      img.decoding = 'sync'; // Синхронное декодирование для приоритетных изображений
    }
    
    img.src = src;
    img.alt = primaryFile;

    // Простая обработка ошибки - скрываем карточку если изображение не загрузилось
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
      const currentSrc = img.src.split('/').pop();
      const link = document.createElement('a');
      link.href = 'Assets/AvatarsFiles/' + currentSrc;
      link.download = currentSrc;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    return card;
  }

  function updateRandomPreview(avatar) {
    randomPreview.innerHTML = '';
    const img = document.createElement('img');
    const primaryFile = getFilename(avatar);
    const src = 'Assets/AvatarsFiles/' + primaryFile;
    
    img.src = src;
    img.alt = primaryFile;
    img.loading = 'eager';
    img.fetchPriority = 'high';

    img.onerror = function() {
      randomPreview.innerHTML = '<p class="error-message">Ошибка загрузки</p>';
    };

    randomPreview.appendChild(img);
    
    randomPreview.onclick = function() {
      const currentSrc = img.src.split('/').pop();
      const link = document.createElement('a');
      link.href = 'Assets/AvatarsFiles/' + currentSrc;
      link.download = currentSrc;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  function showRandomAvatar() {
    if (allAvatars.length === 0) return;
    const randomAvatar = allAvatars[Math.floor(Math.random() * allAvatars.length)];
    updateRandomPreview(randomAvatar);
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
    
    const isFirstBatch = loadedCount === 0;
    
    toLoad.forEach((avatar, index) => {
      // Первые 5 изображений загружаем с высоким приоритетом
      const isPriority = isFirstBatch && index < 5;
      const card = createAvatarCard(avatar, isPriority);
      fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
    loadedCount += toLoad.length;
    
    if (loadedCount < allAvatars.length) {
      loadMoreBtn.style.display = 'block';
    }
    
    isLoading = false;
  }

  // Throttle для scroll события
  let scrollTimeout;
  function handleScroll() {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      if (isLoading) return;
      if (loadedCount >= allAvatars.length) return;
      
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollPosition >= documentHeight - 300) {
        loadMore();
      }
      scrollTimeout = null;
    }, 150);
  }

  fetch('avatars.json')
    .then(response => response.json())
    .then(async data => {
      const avatars = data.avatars;
      if (!avatars || avatars.length === 0) {
        container.innerHTML = '<p class="empty-message">Аватарки пока не добавлены.</p>';
        return;
      }

      allAvatars = avatars;
      
      // Предзагружаем первые 10 изображений мгновенно
      await preloadFirstBatch(allAvatars, 10);
      
      // Загружаем первые 10 аватарок
      loadMore();
      
      // Добавляем обработчик скролла
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
