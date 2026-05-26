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
  let imageCache = new Set(); // Кеш для отслеживания загруженных изображений

  function getFilename(avatar) {
    if (avatar.file.includes('.')) {
      return avatar.file;
    }
    return avatar.file + '.png';
  }

  function getFallbackFilename(avatar) {
    const name = avatar.file.includes('.') ? avatar.file.split('.')[0] : avatar.file;
    if (getFilename(avatar).endsWith('.png')) {
      return name + '.jpg';
    }
    return name + '.png';
  }

  // Предзагрузка изображения
  function preloadImage(src, callback) {
    const img = new Image();
    img.onload = () => {
      if (callback) callback(src);
    };
    img.onerror = () => {
      if (callback) callback(null);
    };
    img.src = src;
  }

  // Пакетная предзагрузка нескольких изображений
  function preloadBatch(avatars, startIndex = 0, count = 10) {
    const toPreload = avatars.slice(startIndex, startIndex + count);
    toPreload.forEach(avatar => {
      const primaryFile = getFilename(avatar);
      const src = 'Assets/AvatarsFiles/' + primaryFile;
      if (!imageCache.has(src)) {
        imageCache.add(src);
        preloadImage(src);
      }
    });
  }

  function createAvatarCard(avatar, preloadPriority = false) {
    const card = document.createElement('div');
    card.className = 'avatar-card';

    const img = document.createElement('img');
    const primaryFile = getFilename(avatar);
    const fallbackFile = getFallbackFilename(avatar);
    const src = 'Assets/AvatarsFiles/' + primaryFile;
    
    img.className = 'avatar-image';
    img.loading = preloadPriority ? 'eager' : 'lazy';
    
    // Используем decode() для ускорения отрисовки
    if (preloadPriority && 'decode' in img) {
      img.decoding = 'async';
    }

    // Устанавливаем src с обработкой ошибок
    const setImageSrc = (srcToLoad) => {
      img.src = srcToLoad;
      img.onerror = function() {
        if (img.src.includes(primaryFile)) {
          img.src = 'Assets/AvatarsFiles/' + fallbackFile;
        } else {
          card.style.display = 'none';
        }
      };
    };

    setImageSrc(src);

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
    const fallbackFile = getFallbackFilename(avatar);
    
    img.src = 'Assets/AvatarsFiles/' + primaryFile;
    img.alt = primaryFile;
    img.loading = 'eager';

    img.onerror = function() {
      if (img.src.includes(primaryFile)) {
        img.src = 'Assets/AvatarsFiles/' + fallbackFile;
      }
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
    
    // Определяем, какие изображения загружаются в первую очередь
    const isFirstBatch = loadedCount === 0;
    
    toLoad.forEach((avatar, index) => {
      const isPriority = isFirstBatch && index < 5; // Первые 5 изображений загружаем с высоким приоритетом
      const card = createAvatarCard(avatar, isPriority);
      fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
    loadedCount += toLoad.length;
    
    // Предзагружаем следующие изображения в фоне
    if (loadedCount < allAvatars.length) {
      setTimeout(() => {
        preloadBatch(allAvatars, loadedCount, 5);
      }, 100);
    }
    
    if (loadedCount < allAvatars.length) {
      loadMoreBtn.style.display = 'block';
    }
    
    isLoading = false;
  }

  // Улучшенная функция обработки скролла с throttle
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
    }, 100);
  }

  // Используем Intersection Observer для предзагрузки при скролле
  let observer;
  function setupIntersectionObserver() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isLoading && loadedCount < allAvatars.length) {
          const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
          if (scrollPercentage > 0.7) { // При достижении 70% скролла
            loadMore();
          }
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(document.body);
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
      
      // Предзагружаем первые 10 изображений до их отображения
      preloadBatch(allAvatars, 0, 10);
      
      loadMore();
      
      window.addEventListener('scroll', handleScroll);
      setupIntersectionObserver();
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
