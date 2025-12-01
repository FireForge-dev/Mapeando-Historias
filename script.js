// trocar para tema escuro

let tick = Number(localStorage.getItem("tick")) || 0;

const root = document.documentElement;

const fundoEscuro = getComputedStyle(root).getPropertyValue('--fundo-escuro');
const fundoClaro  = getComputedStyle(root).getPropertyValue('--fundo-claro');
const footerEscuro = getComputedStyle(root).getPropertyValue('--footer-escuro');
const footerClaro  = getComputedStyle(root).getPropertyValue('--footer-claro');
const navEscuro = getComputedStyle(root).getPropertyValue('--nav-escuro');
const navClaro  = getComputedStyle(root).getPropertyValue('--nav-claro');
const fundoBlocoEscuro = getComputedStyle(root).getPropertyValue('--fundo-bloco-escuro');
const fundoBlocoClaro  = getComputedStyle(root).getPropertyValue('--fundo-bloco-claro');
const letraEscuro = getComputedStyle(root).getPropertyValue('--letras-escuras');
const letraClaro  = getComputedStyle(root).getPropertyValue('--letras-claras');


function thema() {
    if (tick === 0) {
        root.style.setProperty('--fundo', fundoEscuro);
        root.style.setProperty('--footer', footerEscuro);
        root.style.setProperty('--nav', navEscuro);
        root.style.setProperty('--fundo-bloco', fundoBlocoEscuro);
        root.style.setProperty('--letraE', letraClaro);

        tick = 1;
    } else {
        root.style.setProperty('--fundo', fundoClaro);
        root.style.setProperty('--footer', footerClaro);
        root.style.setProperty('--nav', navClaro);
        root.style.setProperty('--fundo-bloco', fundoBlocoClaro);
        root.style.setProperty('--letraE', letraEscuro);

        tick = 0;
    }

    localStorage.setItem("tick", tick);
}

if (tick === 1) {
    root.style.setProperty('--fundo', fundoEscuro);
    root.style.setProperty('--footer', footerEscuro);
    root.style.setProperty('--nav', navEscuro);
    root.style.setProperty('--fundo-bloco', fundoBlocoEscuro);
    root.style.setProperty('--letraE', letraClaro);
}


// --- Animações ---
function iniciarPagina () {
const tlHeader = gsap.timeline({ defaults: { duration: 0.8 }})

tlHeader.from(".navbar", {opacity: 0, y: -50})
  .from(".map", {opacity: 0, y: -50}, "-=0.3")
  .from("#imagem-logo", {opacity: 0, y: -50}, "-=0.3")
  .from(".btn-navbar", {opacity: 0, y:-50}, "-=0.3")
  .from(".switch", {opacity: 0, y: -50}, "-=0.5");

gsap.from(".desc-container", {opacity:0, x:-50}, 1.8)
gsap.from(".mapa-conteudo", {opacity:0, x:50}, 1.8)
}
window.onload = iniciarPagina;

ScrollReveal().reveal(".topo", {
	delay: 200,
	distance: "60px",
	origin: "bottom",
	interval: 200,
	duration: 800,
	easing: "ease-out",
});

ScrollReveal().reveal(".sobre-conteudo", {
	delay: 200,
	distance: "60px",
	origin: "bottom",
	interval: 200,
	duration: 800,
	easing: "ease-out",
});

ScrollReveal().reveal(".box-equipe", {
	delay: 200,
	distance: "60px",
	origin: "bottom",
	interval: 200,
	duration: 800,
	easing: "ease-out",
});


// --- Formulários do sobre ---

document.getElementById("formContato").addEventListener("submit", function (event) {
        event.preventDefault();

        const telefone = document.getElementById("telefone").value.trim();
        const email = document.getElementById("email").value.trim();

        const telefoneValido = /^\d+$/.test(telefone);

        const emailValido = email.includes("@");

        if (!telefoneValido) {
          alert("Por favor, insira um telefone válido, somente números.");
          return;
        }

        if (!emailValido) {
          alert('Por favor, insira um endereço de email válido contendo "@".');
          return;
        }

        alert("Formulário enviado com sucesso!");

        this.reset();
      });
