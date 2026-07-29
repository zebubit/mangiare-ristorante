/* Musica ambiente do Mangiare — volume baixo, continua entre index e cardapio via sessionStorage */
(function(){
  var audio = document.getElementById('ambientMusic');
  var btn = document.getElementById('musicBtn');
  if(!audio || !btn) return;

  var KEY_ON = 'mangiareMusicOn';
  var KEY_TIME = 'mangiareMusicTime';
  audio.volume = 0.15;

  function markPlaying(){ btn.classList.add('playing'); btn.classList.remove('needs-click'); }
  function markPaused(){ btn.classList.remove('playing'); }

  var savedTime = parseFloat(sessionStorage.getItem(KEY_TIME) || '0');
  if(savedTime > 0){
    audio.addEventListener('loadedmetadata', function(){
      try{ if(isFinite(audio.duration) && savedTime < audio.duration) audio.currentTime = savedTime; }catch(e){}
    });
  }

  function startPlay(){
    var p = audio.play();
    if(p && typeof p.then === 'function'){
      p.then(function(){ markPlaying(); sessionStorage.setItem(KEY_ON,'1'); })
       .catch(function(){ btn.classList.add('needs-click'); armarPrimeiroToque(); });
    }
  }

  /* navegador bloqueia som automatico: entao comeca no primeiro toque/clique do visitante */
  var EVENTOS = ['pointerdown','keydown','touchstart'];
  function armarPrimeiroToque(){
    desarmarPrimeiroToque();
    EVENTOS.forEach(function(ev){ document.addEventListener(ev, iniciarNoPrimeiroToque); });
  }
  function desarmarPrimeiroToque(){
    EVENTOS.forEach(function(ev){ document.removeEventListener(ev, iniciarNoPrimeiroToque); });
  }
  function iniciarNoPrimeiroToque(e){
    /* o proprio botao tem o tratamento dele: se entrar aqui, o clique acabaria pausando o que o toque ligou */
    if(e.target && e.target.closest && e.target.closest('#musicBtn')) return;
    desarmarPrimeiroToque();
    if(sessionStorage.getItem(KEY_ON) !== '0' && audio.paused) startPlay();
  }

  btn.classList.add('visible');
  if(sessionStorage.getItem(KEY_ON) === '0'){ markPaused(); }
  else { startPlay(); }

  btn.addEventListener('click', function(){
    if(audio.paused){
      audio.play().then(function(){ markPlaying(); sessionStorage.setItem(KEY_ON,'1'); }).catch(function(){});
    } else {
      audio.pause();
      sessionStorage.setItem(KEY_ON,'0');
      markPaused();
    }
  });

  audio.addEventListener('play', markPlaying);
  audio.addEventListener('pause', markPaused);

  setInterval(function(){ if(!audio.paused) sessionStorage.setItem(KEY_TIME, audio.currentTime); }, 1000);
  window.addEventListener('beforeunload', function(){ sessionStorage.setItem(KEY_TIME, audio.currentTime); });
})();
