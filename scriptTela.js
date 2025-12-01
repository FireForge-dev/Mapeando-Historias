/* ================================
   script.js - atualizado
================================ */

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

/* ---------- Elements ---------- */
const abrirConfigBtn = $('#abrir-configuracoes');
const fecharConfigBtn = $('#fechar-configuracoes');
const janelaConfig = $('#janela-configuracoes');

const janelaMarcador = $('#janela-marcador');
const salvarMarcadorBtn = $('#salvar-marcador');
const cancelarMarcadorBtn = $('#cancelar-marcador');
const previewAnexos = $('#preview-anexos');
const inputAnexo = $('#anexo');
const publicoCheckbox = $('#publico');

const listaMarcadores = $('#lista-marcadores');
const listaFavoritos = $('#lista-favoritos');

const toggleTema = $('#toggle-tema');

const viewer = $('#viewer');
const viewerContent = $('#viewer-content');
const viewerClose = $('#viewer-close');
const viewerPrev = $('#viewer-prev');
const viewerNext = $('#viewer-next');

const searchInput = $('#search-endereco');
const searchBtn = $('#btn-search-endereco');

const toggleMenuBtn = $('#toggle-menu');
const containerEl = document.querySelector('.container');
const barraLateral = $('#barra-lateral');

/* ---------- Filtro público/privado ---------- */
const filtroPublicoBtn = document.createElement('button');
filtroPublicoBtn.textContent = 'Ocultar Públicos';
filtroPublicoBtn.style.marginBottom = '12px';
filtroPublicoBtn.className = 'botao-configuracoes';
filtroPublicoBtn.dataset.ocultarPublicos = 'false';
$('.menu-lateral').prepend(filtroPublicoBtn);

filtroPublicoBtn.addEventListener('click', () => {
    filtroPublicoBtn.dataset.ocultarPublicos = filtroPublicoBtn.dataset.ocultarPublicos === 'false' ? 'true' : 'false';
    filtroPublicoBtn.textContent = filtroPublicoBtn.dataset.ocultarPublicos === 'true' ? 'Mostrar Todos' : 'Ocultar Públicos';
    renderLists();
});

/* ---------- State ---------- */
const STORAGE_KEY = 'mapa_interativo_marcadores_final';
let markers = [];
let tmpCoords = null;
let tmpMarker = null;
let editingId = null;
let viewerState = { id: null, idx: 0 };
let tmpAttachments = [];

/* ---------- Theme (robusto) ---------- */
(function initTheme(){
  try {
    if(!toggleTema){
      console.warn('Toggle de tema não encontrado (#toggle-tema).');
      return;
    }
    const stored = localStorage.getItem('map_theme');
    const isDark = stored === 'dark' || stored === 'escuro' || stored === 'tema-escuro';
    document.body.classList.toggle('tema-escuro', !!isDark);
    toggleTema.checked = !!isDark;
    if(isDark && !document.body.classList.contains('dark')) document.body.classList.add('dark');
  } catch (err) { console.error('Erro ao inicializar tema:', err); }
})();

if (typeof toggleTema !== 'undefined' && toggleTema) {
  toggleTema.addEventListener('change', () => {
    const escuro = !!toggleTema.checked;
    document.body.classList.toggle('tema-escuro', escuro);
    if (escuro) document.body.classList.add('dark'); else document.body.classList.remove('dark');
    localStorage.setItem('map_theme', escuro ? 'escuro' : 'claro');
  });
} else {
  console.warn('toggleTema indefinido — verifique se #toggle-tema existe no DOM antes do script rodar.');
}

/* ---------- Map init ---------- */
const map = L.map('mapa').setView([-23.5505,-46.6333],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'© OpenStreetMap' }).addTo(map);

/* Ensure Leaflet recalculates size after initial load (very important for hidden sidebars) */
setTimeout(()=>{ map.invalidateSize(); }, 300);

/* ---------- Files -> DataURLs ---------- */
function filesToDataURLs(fileList){
  return Promise.all(Array.from(fileList).map(f=>new Promise(res=>{
    const r = new FileReader();
    r.onload = e => res({ id: uid(), nome: f.name, tipo: f.type, conteudo: e.target.result });
    r.readAsDataURL(f);
  })));
}

/* ---------- Config modal ---------- */
if (abrirConfigBtn) abrirConfigBtn.addEventListener('click', ()=> { janelaConfig.style.display='flex'; janelaConfig.setAttribute('aria-hidden','false'); });
if (fecharConfigBtn) fecharConfigBtn.addEventListener('click', ()=> { janelaConfig.style.display='none'; janelaConfig.setAttribute('aria-hidden','true'); });
if (janelaConfig) janelaConfig.addEventListener('click', e=> { if(e.target===janelaConfig) { janelaConfig.style.display='none'; janelaConfig.setAttribute('aria-hidden','true'); } });

/* ---------- Map click -> marker modal ---------- */
map.on('click', e=>{
  tmpCoords = e.latlng;
  if(tmpMarker) map.removeLayer(tmpMarker);
  tmpMarker = L.marker(tmpCoords).addTo(map);
  $('#titulo').value = '';
  $('#descricao').value = '';
  if(inputAnexo) inputAnexo.value = '';
  previewAnexos.innerHTML = '';
  publicoCheckbox.checked = true;
  tmpAttachments = [];
  editingId = null;
  if(janelaMarcador){ janelaMarcador.style.display = 'flex'; janelaMarcador.setAttribute('aria-hidden','false'); }
});

/* ---------- Cancel ---------- */
if(cancelarMarcadorBtn) cancelarMarcadorBtn.addEventListener('click', ()=>{
  if(tmpMarker){ map.removeLayer(tmpMarker); tmpMarker=null; }
  tmpCoords = null; editingId = null; tmpAttachments = []; previewAnexos.innerHTML = '';
  if(janelaMarcador){ janelaMarcador.style.display = 'none'; janelaMarcador.setAttribute('aria-hidden','true'); }
});

/* ---------- Preview instantâneo ---------- */
if(inputAnexo) inputAnexo.addEventListener('change', async ()=>{
  const files = Array.from(inputAnexo.files);
  const newAttachments = await filesToDataURLs(files);
  tmpAttachments.push(...newAttachments);
  renderPreviewAttachments();
});

function renderPreviewAttachments(){
  previewAnexos.innerHTML = '';
  tmpAttachments.forEach((a, idx)=>{
    let el = document.createElement('div');
    if(a.tipo.startsWith('image/')) el.innerHTML = `<img src="${a.conteudo}" /><button class="remove-btn" data-idx="${idx}">✖</button>`;
    else if(a.tipo.startsWith('video/')) el.innerHTML = `<video src="${a.conteudo}" controls></video><button class="remove-btn" data-idx="${idx}">✖</button>`;
    else el.innerHTML = `<audio src="${a.conteudo}" controls></audio><button class="remove-btn" data-idx="${idx}">✖</button>`;
    el.classList.add('preview-item');
    previewAnexos.appendChild(el);
  });
}

previewAnexos.addEventListener('click', e=>{
  if(e.target.classList.contains('remove-btn')){
    const idx = parseInt(e.target.dataset.idx,10);
    tmpAttachments.splice(idx,1);
    renderPreviewAttachments();
  }
});

/* ---------- Save ---------- */
if(salvarMarcadorBtn) salvarMarcadorBtn.addEventListener('click', ()=>{
  const titulo = $('#titulo').value.trim() || 'Sem título';
  const descricao = $('#descricao').value.trim() || '';
  const publico = publicoCheckbox.checked;

  const novo = {
    id: editingId || uid(),
    title: titulo,
    desc: descricao,
    coords: tmpCoords || markers.find(m=>m.id===editingId)?.coords,
    attachments: tmpAttachments,
    favorito: false,
    publico: publico,
    usuario: 'Usuário'
  };

  if(editingId){
    const antiga = markers.find(m => m.id === editingId);
    if(antiga){
      novo.favorito = antiga.favorito;
      antiga.markerObj.setLatLng(novo.coords);
      antiga.markerObj.bindPopup(popupHTML(novo), { minWidth:220, maxWidth:360 });
      markers = markers.filter(m=>m.id!==editingId);
    }
    editingId = null;
  }

  if(tmpMarker){ map.removeLayer(tmpMarker); tmpMarker=null; tmpCoords=null; }

  novo.markerObj = L.marker(novo.coords).addTo(map);
  novo.markerObj.bindPopup(popupHTML(novo), { minWidth:220, maxWidth:360 });
  markers.push(novo);
  tmpAttachments = [];
  previewAnexos.innerHTML = '';
  if(janelaMarcador){ janelaMarcador.style.display='none'; janelaMarcador.setAttribute('aria-hidden','true'); }

  persist();
  renderLists();
});

/* ---------- Popup HTML ---------- */
function popupHTML(item){
  let thumbs='';
  if(item.attachments && item.attachments.length){
    thumbs='<div class="thumbs">';
    item.attachments.forEach((a,idx)=>{
      if(a.tipo.startsWith('image/')) thumbs+=`<img class="thumb" src="${a.conteudo}" data-id="${item.id}" data-idx="${idx}"/>`;
      else if(a.tipo.startsWith('video/')) thumbs+=`<video class="thumb" src="${a.conteudo}" data-id="${item.id}" data-idx="${idx}"></video>`;
      else thumbs+=`<div class="thumb audio-thumb" data-id="${item.id}" data-idx="${idx}">🎵</div>`;
    });
    thumbs+='</div>';
  }
  const fav = item.favorito?'⭐':'☆';
  const publicoTxt = item.publico?'Público':'Privado';
  return `<div class="popup-card">
    <h4>${escapeHtml(item.title)}</h4>
    <p><strong>${escapeHtml(item.usuario)}</strong> - ${publicoTxt}</p>
   <p style="overflow-wrap: break-word;">${escapeHtml(item.desc)}</p>${thumbs}
    <div style="margin-top:8px;display:flex;gap:2px;justify-content:flex-end">
      <button onclick="window.openEditor('${item.id}')">✏️</button>
      <button onclick="window.removeMarker('${item.id}')">🗑️</button>
      <button onclick="window.toggleFav('${item.id}')">${fav}</button>
      <button onclick="window.goTo('${item.id}')">📍</button>
    </div>
  </div>`;
}

/* ---------- Viewer (abrir thumbnails) ---------- */
document.body.addEventListener('click', ev=>{
  const t = ev.target;
  if(t.matches('.thumb, .audio-thumb')){
    const id = t.dataset.id;
    const idx = parseInt(t.dataset.idx,10);
    openViewer(id,idx);
  }
});

function openViewer(id, idx){
  viewerState.id = id; viewerState.idx = idx;
  renderViewer();
  viewer.style.display='flex';
  viewer.setAttribute('aria-hidden','false');
}

function renderViewer(){
  const item = markers.find(m => m.id === viewerState.id);
  if(!item) return;
  const a = item.attachments[viewerState.idx];
  viewerContent.innerHTML='';

  if(a.tipo.startsWith('image/')){
    const img = document.createElement('img');
    img.src = a.conteudo;
    viewerContent.appendChild(img);
  }
  else if(a.tipo.startsWith('video/')){
    const vid = document.createElement('video');
    vid.src = a.conteudo;
    vid.controls = true;
    vid.autoplay = true;
    viewerContent.appendChild(vid);
  }
  else if(a.tipo.startsWith('audio/')){
    const audio = document.createElement('audio');
    audio.src = a.conteudo;
    audio.controls = true;
    audio.autoplay = true;
    viewerContent.appendChild(audio);
  }
}

if(viewerClose) viewerClose.addEventListener('click', ()=>{ viewer.style.display='none'; viewerContent.innerHTML=''; viewer.setAttribute('aria-hidden','true'); });
if(viewerPrev) viewerPrev.addEventListener('click', ()=>{ const item=markers.find(m=>m.id===viewerState.id); if(!item) return; viewerState.idx=(viewerState.idx-1+item.attachments.length)%item.attachments.length; renderViewer(); });
if(viewerNext) viewerNext.addEventListener('click', ()=>{ const item=markers.find(m=>m.id===viewerState.id); if(!item) return; viewerState.idx=(viewerState.idx+1)%item.attachments.length; renderViewer(); });

/* ---------- Actions Globais (editor, remover, fav, goTo) ---------- */
function openEditor(id){
  const it = markers.find(m => m.id===id);
  if(!it) return;
  editingId = id;
  tmpCoords = it.coords;
  $('#titulo').value=it.title;
  $('#descricao').value=it.desc;
  publicoCheckbox.checked = it.publico;
  tmpAttachments = [...it.attachments];
  renderPreviewAttachments();
  if(janelaMarcador){ janelaMarcador.style.display='flex'; janelaMarcador.setAttribute('aria-hidden','false'); }
}
function removeMarker(id){
  const idx = markers.findIndex(m => m.id===id);
  if(idx===-1) return;
  if(markers[idx].markerObj) map.removeLayer(markers[idx].markerObj);
  markers.splice(idx,1); persist(); renderLists();
}
function toggleFav(id){
  const it = markers.find(m=>m.id===id);
  if(!it) return;
  it.favorito=!it.favorito; persist(); renderLists();
}
function goTo(id){
  const it = markers.find(m=>m.id===id);
  if(!it) return;
  map.setView(it.coords,15); 
  if(it.markerObj) it.markerObj.openPopup();
}

/* expose globally for popup-inline buttons */
window.openEditor = openEditor;
window.removeMarker = removeMarker;
window.toggleFav = toggleFav;
window.goTo = goTo;

/* ---------- Render lists ---------- */
function renderLists(){
  listaMarcadores.innerHTML=''; listaFavoritos.innerHTML='';
  const ocultarPublicos = filtroPublicoBtn.dataset.ocultarPublicos === 'true';
  markers.forEach(m=>{
    const mostrarNaLista = !(ocultarPublicos && m.publico);
    const li=document.createElement('li');
    li.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:2px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>${m.title}</span>
          <div>
            <button class="mini-fav">${m.favorito?'⭐':'☆'}</button>
            <button class="mini-go">➡</button>
          </div>
        </div>
        <small>${m.usuario} - ${m.publico?'Público':'Privado'}</small>
      </div>`;
    li.querySelector('.mini-go').addEventListener('click', ()=>{ map.setView(m.coords,15); if(m.markerObj) m.markerObj.openPopup(); });
    li.querySelector('.mini-fav').addEventListener('click', ()=>{ m.favorito=!m.favorito; persist(); renderLists(); });
    if(m.favorito) listaFavoritos.appendChild(li);
    else if(mostrarNaLista) listaMarcadores.appendChild(li);
    if(m.markerObj){
      if(ocultarPublicos && m.publico) map.removeLayer(m.markerObj);
      else m.markerObj.addTo(map);
    }
  });
  if(!listaFavoritos.hasChildNodes()) listaFavoritos.innerHTML='<li style="opacity:.6">Nenhum favorito</li>';
}

/* ---------- Persist / Load ---------- */
function persist(){ 
  localStorage.setItem(STORAGE_KEY,JSON.stringify(markers.map(m=>({
    id:m.id,title:m.title,desc:m.desc,coords:m.coords,attachments:m.attachments,favorito:m.favorito,publico:m.publico,usuario:m.usuario
  }))));
}

function load(){
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  markers = raw.map(r=>({...r}));
  markers.forEach(m=>{ 
    m.markerObj = L.marker(m.coords).addTo(map);
    m.markerObj.bindPopup(popupHTML(m), { minWidth:220, maxWidth:360 });
  });
  renderLists();
}
load();

/* ---------- Utilities ---------- */
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

/* ---------- Buscar endereço ---------- */
async function buscarEndereco(){
  const q = searchInput.value.trim();
  if(!q) return;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if(data.length>0){
      const { lat, lon } = data[0];
      map.setView([parseFloat(lat), parseFloat(lon)], 15);
      setTimeout(()=>map.invalidateSize(), 250);
    } else {
      alert('Endereço não encontrado');
    }
  } catch(err){
    console.error(err);
    alert('Erro ao buscar endereço');
  }
}

if(searchBtn) searchBtn.addEventListener('click', buscarEndereco);
if(searchInput) searchInput.addEventListener('keypress', e=>{ if(e.key==='Enter') buscarEndereco(); });

/* ---------- Menu toggle (mobile) ---------- */
function openSidebar(){
  containerEl.classList.remove('sidebar-closed');
  containerEl.classList.add('sidebar-open');
  setTimeout(()=>map.invalidateSize(), 300);
}
function closeSidebar(){
  containerEl.classList.remove('sidebar-open');
  containerEl.classList.add('sidebar-closed');
  setTimeout(()=>map.invalidateSize(), 300);
}

/* initial behavior: on small screens keep closed */
function adaptSidebarOnResize(){
  if(window.innerWidth < 768) {
    closeSidebar();
  } else {
    // on desktop ensure open
    containerEl.classList.remove('sidebar-closed');
    containerEl.classList.remove('sidebar-open');
  }
}
window.addEventListener('resize', ()=>{ adaptSidebarOnResize(); setTimeout(()=>map.invalidateSize(), 250); });
adaptSidebarOnResize();

if(toggleMenuBtn) toggleMenuBtn.addEventListener('click', ()=>{
  if(containerEl.classList.contains('sidebar-open')) closeSidebar();
  else openSidebar();
});

/* close sidebar when clicking outside on mobile */
document.addEventListener('click', (e)=>{
  if(window.innerWidth >= 768) return;
  if(!containerEl.classList.contains('sidebar-open')) return;
  const inside = e.composedPath().includes(barraLateral) || e.target === toggleMenuBtn;
  if(!inside) closeSidebar();
});

/* ---------- Keyboard handlers (Esc to close modals) ---------- */
document.addEventListener('keydown', e=>{
  if(e.key === 'Escape'){
    if(janelaConfig && janelaConfig.style.display === 'flex') { janelaConfig.style.display='none'; janelaConfig.setAttribute('aria-hidden','true'); }
    if(janelaMarcador && janelaMarcador.style.display === 'flex') { janelaMarcador.style.display='none'; janelaMarcador.setAttribute('aria-hidden','true'); if(tmpMarker){ map.removeLayer(tmpMarker); tmpMarker=null; } }
    if(viewer && viewer.style.display === 'flex') { viewer.style.display='none'; viewer.setAttribute('aria-hidden','true'); viewerContent.innerHTML=''; }
  }
});

/* Ensure map resizes when CSS transitions finish (useful when sidebar slides) */
const obs = new MutationObserver(()=>{ setTimeout(()=>map.invalidateSize(), 220); });
obs.observe(document.querySelector('.container'), { attributes: true, attributeFilter: ['class'] });

