// 1x03e.js
(function() {
  const savedTheme = localStorage.getItem('fordis-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  function updateLogo() {
    const brandIcon = document.getElementById('brandIcon');
    const favicon = document.getElementById('faviconLight');
    
    if (document.body.classList.contains('dark-theme')) {
      if (brandIcon) brandIcon.src = 'Pictures/sitelogob.png';
      if (favicon) favicon.href = 'Pictures/sitelogob.png';
    } else {
      if (brandIcon) brandIcon.src = 'Pictures/sitelogow.png';
      if (favicon) favicon.href = 'Pictures/sitelogow.png';
    }
  }

  updateLogo();

  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        updateLogo();
      }
    });
  });

  observer.observe(document.body, { attributes: true });

  const sliderTrack = document.getElementById('sliderTrack');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const revealEmailBtn = document.getElementById('revealEmailBtn');
  const emailDisplay = document.getElementById('emailDisplay');

  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (searchInput && searchResults) {
    const pages = [
      { name: 'Главная', url: 'index' },
      { name: 'Аватарки', url: 'avatars' },
      { name: 'Звуки', url: 'sounds' },
      { name: 'Клиенты', url: 'clients' },
      { name: 'Боты', url: 'bots' },
      { name: 'Контакты', url: 'contacts' },
      { name: 'Правила', url: 'rules' },
      { name: 'Настройки', url: 'settings-site' },
      { name: 'Новости', url: 'news' },
      { name: 'Discord в России', url: 'zapret-help' }
    ];

    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      
      if (query.length === 0) {
        searchResults.classList.remove('active');
        return;
      }

      const filtered = pages.filter(page => 
        page.name.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
      } else {
        searchResults.innerHTML = filtered.map(page => 
          `<div class="search-result-item" data-url="${page.url}">${page.name}</div>`
        ).join('');
      }

      searchResults.classList.add('active');

      document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function() {
          const url = this.getAttribute('data-url');
          if (url) {
            window.location.href = url;
          }
        });
      });
    });

    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });
  }

  if (sliderTrack) {
    const slides = document.querySelectorAll('.slide');
    let currentIndex = 0;
    const totalSlides = slides.length;
    const switchInterval = 5000;
    let slideTimer;

    function updateSlider(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;
      sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function nextSlide() {
      updateSlider(currentIndex + 1);
    }

    function prevSlide() {
      updateSlider(currentIndex - 1);
    }

    function resetTimer() {
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, switchInterval);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        nextSlide();
        resetTimer();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        prevSlide();
        resetTimer();
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', function(e) {
        e.preventDefault();
        const index = parseInt(this.getAttribute('data-index'));
        updateSlider(index);
        resetTimer();
      });
    });

    updateSlider(0);
    slideTimer = setInterval(nextSlide, switchInterval);
  }

  if (revealEmailBtn) {
    revealEmailBtn.addEventListener('click', function(e) {
      e.preventDefault();
      emailDisplay.textContent = 'inceptdevs@gmail.com';
      revealEmailBtn.style.display = 'none';
    });
  }

  const allButtons = document.querySelectorAll('.site-brand, .panel-btn, .side-nav-btn, .sidebar-btn, .side-arrow, .dot, .email-reveal-btn');
  allButtons.forEach(btn => {
    btn.addEventListener('mousedown', (e) => e.preventDefault());
  });
})();
