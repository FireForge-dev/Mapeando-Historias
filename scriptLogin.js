// --- Login ---
document.getElementById("formLogin").addEventListener("submit", function (eventLogin) {
    eventLogin.preventDefault();

    const email = document.getElementById("input-email").value.trim();
    const senha = document.getElementById("input-senha").value.trim();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const senhaValida = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$";

    if(!emailValido) {
        alert('Por favor, insira um  endereço de email válido.');
        return;
    }

    if(!senhaValida) {
        alert('Por favor, insira uma senha válida');
    }

    alert("Login realizado com sucesso!");
    window.location.replace("indexTela.html")
})

gsap.from(".container", {opacity: 0, y:-50, duration: 1})

