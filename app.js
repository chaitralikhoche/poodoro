
(function(){
  // utilities
  function qs(sel, ctx=document){return ctx.querySelector(sel)}
  function qsa(sel, ctx=document){return Array.from((ctx||document).querySelectorAll(sel))}

  // storage helpers
  const STORAGE_KEY = 'poodoro_recipes_v1'
  function loadRecipes(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch(e){ return [] }
  }
  function saveRecipes(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }

  // DOM refs
  const recipesEl = qs('#recipes')
  const addBtn = qs('#add')
  const searchInput = qs('#search')
  const surpriseBtn = qs('#surprise')
  const favesBtn = qs('#favesBtn')
  const vaultBtn = qs('#vaultBtn')
  const splash = qs('#splash')
  const sticky = qs('#sticky')
  const vaultModal = qs('#vault')
  const vaultOpen = qs('#vaultOpen')
  const vaultClose = qs('#vaultClose')
  const vaultPass = qs('#vaultPass')
  const favouritesModal = qs('#favouritesModal')
  const closeFaves = qs('#closeFaves')
  const faveList = qs('#faveList')

  // initial sample recipes
  let recipes = loadRecipes();
  if(recipes.length===0){
    recipes = [
      {title:'Avocado Toast Love', link:'https://youtube.com/shorts/THr8KjgsFps?si=7wR-9zv7sUTdP7HQ', desc:'Quick avo toast with veggies', thumb:'poodoro_pose_1.png'},
      {title:'Green Smoothie Morning', link:'https://youtube.com/shorts/abc', desc:'Fresh green boost', thumb:'poodoro_pose_3.png'}
    ];
    saveRecipes(recipes);
  }

  // helper: try multiple path variants to tolerate slash-prefixed uploads
  function candidatePaths(name){
    const list = [];
    list.push('poodoro/' + name);
    list.push('%2Fpoodoro/' + name);
    list.push('/poodoro/' + name);
    list.push('%2Fpoodoro%2F' + name);
    return list;
  }
  function existsAny(paths, cb){
    let i=0;
    function test(){
      if(i>=paths.length){ cb(null); return; }
      const img = new Image();
      img.onload = function(){ cb(paths[i]); }
      img.onerror = function(){ i++; test(); }
      img.src = paths[i];
    }
    test();
  }

  function render(){
    recipesEl.innerHTML = '';
    const q = (searchInput.value||'').toLowerCase();
    recipes.forEach((r, idx) => {
      if(q && !(r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))) return;
      const card = document.createElement('div'); card.className='card';
      const img = document.createElement('img'); img.className='thumb';
      const name = r.thumb || 'poodoro_pose_1.png';
      existsAny(candidatePaths(name), function(src){
        if(src) img.src = src;
        else img.src = 'poodoro/' + name;
      });
      card.appendChild(img);
      const t = document.createElement('div'); t.className='title hand'; t.textContent = r.title; card.appendChild(t);
      const d = document.createElement('div'); d.className='desc'; d.textContent = r.desc; card.appendChild(d);
      const actions = document.createElement('div'); actions.className='actions';
      const watch = document.createElement('a'); watch.href = r.link; watch.target='_blank'; watch.textContent='Watch →'; watch.className='small';
      const fav = document.createElement('button'); fav.textContent = isFav(idx)?'💖':'🤍';
      fav.onclick = function(){ toggleFav(idx); render(); };
      actions.appendChild(watch); actions.appendChild(fav);
      card.appendChild(actions);
      recipesEl.appendChild(card);
    });
  }

  // favorites stored per-title
  function favKey(){ return 'poodoro_favs_v1' }
  function loadFavs(){ try{ return JSON.parse(localStorage.getItem(favKey())||'[]') }catch(e){return[]} }
  function saveFavs(a){ localStorage.setItem(favKey(), JSON.stringify(a)) }
  function isFav(i){ const f=loadFavs(); return f.includes(recipes[i].title) }
  function toggleFav(i){ const f=loadFavs(); const t=recipes[i].title; if(f.includes(t)) f.splice(f.indexOf(t),1); else f.push(t); saveFavs(f); }

  // add recipe
  addBtn.onclick = function(){
    const title = qs('#title').value.trim();
    const link = qs('#link').value.trim();
    const desc = qs('#desc').value.trim();
    const thumb = qs('#thumbSelect').value || 'poodoro_pose_1.png';
    if(!title||!link) return alert('Add title and link');
    recipes.unshift({title,link,desc,thumb});
    saveRecipes(recipes);
    qs('#title').value='';qs('#link').value='';qs('#desc').value='';
    render();
  }

  // search
  searchInput.oninput = render;

  // surprise
  surpriseBtn.onclick = function(){
    if(recipes.length===0) return;
    const r = recipes[Math.floor(Math.random()*recipes.length)];
    window.open(r.link,'_blank');
  }

  // favourites modal
  favesBtn.onclick = function(){
    favouritesModal.classList.remove('hidden');
    const f = loadFavs();
    faveList.innerHTML = '';
    f.forEach(name=>{
      const el = document.createElement('div'); el.textContent = name; faveList.appendChild(el);
    });
  }
  closeFaves.onclick = function(){ favouritesModal.classList.add('hidden') }

  // vault
  vaultBtn.onclick = function(){ vaultModal.classList.remove('hidden') }
  vaultClose.onclick = function(){ vaultModal.classList.add('hidden') }
  vaultOpen.onclick = function(){
    const pass = vaultPass.value.trim();
    if(pass==='poodoro') { qs('#vaultContent').classList.remove('hidden'); } else { alert('Wrong password') }
  }

  // splash auto-close
  setTimeout(()=>{ splash.style.display='none' }, 1500);

  // initial render
  render();

})();
