// Função que roda quando clica no botão "Salvar História"
async function salvarNovaHistoria() {
    
    // 1. Pegar os dados que o usuário digitou no HTML
    const tituloDigitado = document.getElementById('input-titulo').value;
    const textoDigitado = document.getElementById('input-historia').value;
    const arquivoFoto = document.getElementById('input-foto').files[0]; // O arquivo real
    
    // Vamos fingir que pegamos isso do clique no mapa
    const latitude = -23.5505; 
    const longitude = -46.6333;

    // 2. Primeiro: Enviar a FOTO para a "Caixa de Arquivos" (Storage)
    // Criamos um nome único para a foto não substituir outra (usamos a data de hoje)
    const nomeArquivo = Date.now() + "-" + arquivoFoto.name;
    
    const { data: dadosArquivo, error: erroUpload } = await supabase
        .storage
        .from('imagens') // Nome que demos ao bucket
        .upload(nomeArquivo, arquivoFoto);

    if (erroUpload) {
        alert("Erro ao subir foto!");
        return; // Para tudo se der erro
    }

    // 3. Pegar o LINK dessa foto que acabamos de subir
    // O Supabase monta o link público pra gente
    const { data: dadosUrl } = supabase
        .storage
        .from('imagens')
        .getPublicUrl(nomeArquivo);

    const linkDaFoto = dadosUrl.publicUrl;

    // 4. Segundo: Salvar o TEXTO e o LINK na "Planilha" (Tabela)
    const { error: erroBanco } = await supabase
        .from('historias') // Nome da tabela
        .insert({
            titulo: tituloDigitado,
            historia: textoDigitado,
            lat: latitude,
            lng: longitude,
            foto: linkDaFoto // Aqui salvamos só o link!
        });

    if (erroBanco) {
        alert("Erro ao salvar no banco!");
        console.log(erroBanco);
    } else {
        alert("História salva com sucesso!");
        // Aqui você pode fechar o modal ou limpar os campos
    }
}