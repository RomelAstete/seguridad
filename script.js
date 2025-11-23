// script.js - interactividad, generador, historial, navegación activa, smooth scroll

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const lengthInput = document.getElementById('length');
  const lengthValue = document.getElementById('lengthValue');
  const uppercase = document.getElementById('uppercase');
  const lowercase = document.getElementById('lowercase');
  const numbers = document.getElementById('numbers');
  const symbols = document.getElementById('symbols');
  const generateBtn = document.getElementById('generateBtn');
  const passwordOutput = document.getElementById('passwordOutput');
  const copyBtn = document.getElementById('copyBtn');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  const historyList = document.getElementById('historyList');
  const genInputPlaceholder = document.getElementById('genInput'); // legacy if present

  // Show length
  if(lengthInput) lengthInput.addEventListener('input', () => lengthValue.textContent = lengthInput.value);

  // Password generator using crypto when available
  function secureRandomInt(max) {
    if(window.crypto && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function buildCharset() {
    let chars = '';
    if(uppercase && uppercase.checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if(lowercase && lowercase.checked) chars += 'abcdefghijklmnopqrstuvwxyz';
    if(numbers && numbers.checked) chars += '0123456789';
    if(symbols && symbols.checked) chars += '!@#$%^&*()_+[]{}<>?,.;:|-=';
    return chars;
  }

  function generatePassword(len) {
    const chars = buildCharset();
    if(!chars) return '';
    let out = '';
    for(let i=0;i<len;i++){
      out += chars[secureRandomInt(chars.length)];
    }
    return out;
  }

  // Strength estimator (simple but informative)
  function estimateStrength(pw) {
    if(!pw) return 0;
    let score = 0;
    if(pw.length >= 8) score += Math.min(40, pw.length * 2);
    if(/[A-Z]/.test(pw)) score += 15;
    if(/[a-z]/.test(pw)) score += 15;
    if(/[0-9]/.test(pw)) score += 15;
    if(/[^A-Za-z0-9]/.test(pw)) score += 15;
    return Math.min(100, score);
  }

  function updateStrength(pw) {
    const score = estimateStrength(pw);
    strengthBar.style.width = score + '%';
    strengthText.textContent = score + '%';
    strengthBar.className = 'progress-bar';
    if(score < 40) strengthBar.classList.add('bg-danger');
    else if(score < 70) strengthBar.classList.add('bg-warning');
    else strengthBar.classList.add('bg-success');
  }

  // History (last 6)
  function pushHistory(pw) {
    if(!historyList) return;
    const li = document.createElement('li');
    li.className = 'list-group-item bg-transparent text-monospace small';
    li.textContent = pw;
    // prepend and keep max 6
    historyList.insertBefore(li, historyList.firstChild);
    while(historyList.children.length > 6) historyList.removeChild(historyList.lastChild);
  }

  // Generate button click
  if(generateBtn) {
    generateBtn.addEventListener('click', () => {
      const len = Number(lengthInput ? lengthInput.value : 16);
      const pw = generatePassword(len);
      if(passwordOutput) passwordOutput.value = pw;
      if(genInputPlaceholder) genInputPlaceholder.value = pw; // legacy field
      updateStrength(pw);
      if(pw) pushHistory(pw);
      // small animation
      generateBtn.classList.add('animate__animated','animate__pulse');
      setTimeout(()=> generateBtn.classList.remove('animate__animated','animate__pulse'), 700);
    });
  }

  // Copy button
  if(copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = passwordOutput.value || (genInputPlaceholder && genInputPlaceholder.value) || '';
      if(!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.innerHTML = '<i class="fa fa-check"></i>';
        setTimeout(()=> copyBtn.innerHTML = '<i class="fa fa-copy"></i>', 1300);
      } catch(e) {
        // fallback select
        passwordOutput.select();
        document.execCommand('copy');
        copyBtn.innerHTML = '<i class="fa fa-check"></i>';
        setTimeout(()=> copyBtn.innerHTML = '<i class="fa fa-copy"></i>', 1300);
      }
    });
  }

  // If there's an old genInput button (from other variants), connect it
  const oldGenBtn = document.getElementById('genBtn');
  if(oldGenBtn && genInputPlaceholder) {
    oldGenBtn.addEventListener('click', () => {
      const pw = generatePassword(16);
      genInputPlaceholder.value = pw;
    });
  }

  // Smooth scroll for anchor links (native CSS scroll-behavior is set, but ensure offset for fixed nav)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if(target){
        e.preventDefault();
        const yOffset = -68; // header height
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    });
  });

  // Scroll to top shortcut
  const scrollTopBtn = document.getElementById('scrollTop');
  if(scrollTopBtn){
    scrollTopBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
  }

  // Active nav link via IntersectionObserver
  const sections = document.querySelectorAll('main [id], header [id]');
  const navLinks = document.querySelectorAll('.navbar .nav-link');
  const obsOptions = { root: null, rootMargin: '0px', threshold: 0.45 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if(!id) return;
      const link = document.querySelector(`.navbar a[href="#${id}"]`);
      if(entry.isIntersecting) {
        navLinks.forEach(n => n.classList.remove('active'));
        if(link) link.classList.add('active');
      }
    });
  }, obsOptions);
  sections.forEach(s => observer.observe(s));

  // Init: generate one password so UI isn't empty
  if(generateBtn) generateBtn.click();
});
