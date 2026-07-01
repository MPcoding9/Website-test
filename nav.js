/* Son Auba Retreat — shared nav, reveal-on-scroll, form-demo, active-link behaviour.
   Loaded by every page: index.html and room-*.html */
(function(){
  document.documentElement.classList.add('js');

  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('form.demo-form').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = form.dataset.successText || 'Sent';
        btn.disabled = true;
      }
    });
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---- Active nav-link state ---- */
  var page = document.body.getAttribute('data-page');
  var navLinks = document.querySelectorAll('.nav-links a');

  if (page === 'stays') {
    navLinks.forEach(function(a){
      if (a.getAttribute('href').indexOf('#stays') !== -1) a.classList.add('active');
    });
  } else if (page === 'home' && 'IntersectionObserver' in window) {
    var sectionIds = ['finca', 'gallery', 'how', 'stays', 'testimonials', 'contact'];
    var sectionEls = sectionIds.map(function(id){ return document.getElementById(id); }).filter(Boolean);
    if (sectionEls.length) {
      var spy = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (!entry.isIntersecting) return;
          var link = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
          if (!link) return;
          navLinks.forEach(function(a){ a.classList.remove('active'); });
          link.classList.add('active');
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
      sectionEls.forEach(function(el){ spy.observe(el); });
    }
  }
})();
