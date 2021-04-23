function VerificaUsuarioLogado(){
    let conteudo = sessionStorage.getItem("usuario");
    
    if (conteudo == null) {
        alert('Você não realizou o login!\nRetornado à página de login...');
        window.location.href = "./index.html";
        return false;
    } else{
        let usuario = JSON.parse(conteudo);

        document.getElementById('boasVindas').innerHTML = `Olá ${usuario.nome}`;
    }

    return true;
}