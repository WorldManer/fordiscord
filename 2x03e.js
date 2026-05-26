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
  let currentRandomCard = null;

  const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

  async function checkFileExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function findAvatarFile(filename) {
    if (filename.includes('.')) {
      const exists = await checkFileExists('Assets/AvatarsFiles/' + filename);
      return exists ? filename : null;
    }
    for (const ext of extensions) {
      const fullName = filename + ext;
      const exists = await checkFileExists('Assets/AvatarsFiles/' + fullName);
      if (exists) return fullName;
    }
    return null;
  }

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
    
    if (currentRandomCard) {
      currentRandomCard.style.border = '1px solid #e0e0e0';
      currentRandomCard.style.transform = 'scale(1)';
      currentRandomCard.style.zIndex = '1';
      currentRandomCard = null;
    }

    const randomFile = allAvatars[Math.floor(Math.random() * allAvatars.length)];
    updateRandomPreview(randomFile);
  }

  function loadMore() {
    if (isLoading) return;
    isLoading = true;
    
    const toLoad = allAvatars.slice(loadedCount, loadedCount + batchSize);
    
    requestAnimationFrame(() => {
      toLoad.forEach(filename => {
        const card = createAvatarCard(filename);
        container.appendChild(card);
      });
      loadedCount += toLoad.length;
      
      if (loadedCount >= allAvatars.length) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'block';
      }
      
      isLoading = false;
    });
  }

  function handleScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollPosition >= documentHeight - 200) {
      if (loadedCount < allAvatars.length && !isLoading) {
        loadMore();
      }
    }
  }

  fetch('avatars.json')
    .then(response => response.json())
    .then(async data => {
      const avatars = data.avatars;
      if (!avatars || avatars.length === 0) {
        container.innerHTML = '<p class="empty-message">Аватарки пока не добавлены.</p>';
        return;
      }

      const foundFiles = [];
      for (const avatar of avatars) {
        const filename = await findAvatarFile(avatar.file);
        if (filename) {
          foundFiles.push(filename);
        }
      }

      if (foundFiles.length === 0) {
        container.innerHTML = '<p class="empty-message">Аватарки пока не добавлены.</p>';
        return;
      }

      allAvatars = foundFiles;
      
      requestAnimationFrame(() => {
        loadMore();
      });
      
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
