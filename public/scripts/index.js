function TrocarDiv(divAtual, divNova) {
    let DivAtual = document.getElementById(divAtual); 
    DivAtual.style.display = 'none';
    
    let DivNova = document.getElementById(divNova);
    DivNova.style.display = 'block';

    return false;
}

function ResetarErrosRegistro(){
    document.getElementById('erroNome').innerHTML = "";
    document.getElementById('erroEmail').innerHTML = "";
    document.getElementById('erroSenha').innerHTML = "";
    document.getElementById('erroSenhaConfirma').innerHTML = "";
}

function ValidarUsuario(nome, email, senha , senhaConfirma){
    let sucesso = true;

    ResetarErrosRegistro();    

    if (nome.length < 1){
        document.getElementById('erroNome').innerHTML = "Informe um nome para registrar o usuário!";
        sucesso = false;
    }

    if (email.length < 1){
        document.getElementById('erroEmail').innerHTML = "Informe um e-mail para registrar o usuário!";
        sucesso = false;
    }

    if (senha.length < 1){
        document.getElementById('erroSenha').innerHTML = "Informe uma senha para o seu usuário!";
        sucesso = false;
    }
    
    if (senhaConfirma.length < 1){
        document.getElementById('erroSenhaConfirma').innerHTML = "Confirme a senha informada!";
        sucesso = false;
    }

    if (senha != senhaConfirma){
        document.getElementById('erroSenhaConfirma').innerHTML = "As senhas informadas não são iguais!";
        sucesso = false;
    }

    return sucesso;                    
}

function CadastrarUsuario(){
    let nome = document.forms["FormRegistro"]["txtNomeRegistro"].value;
    let email = document.forms["FormRegistro"]["txtEmailRegistro"].value;
    let senha = document.forms["FormRegistro"]["txtSenhaRegistro"].value;
    let senhaConfirma = document.forms["FormRegistro"]["txtSenhaConfirma"].value;

    if (ValidarUsuario(nome, email, senha, senhaConfirma) == false)
        return false;
            
    let headers = new Headers();
    headers.append("Content-Type", "application/json");

    fetch("http://localhost:5000/api/usuarios", {
        method: "POST",
        body: JSON.stringify({ nome: `${nome}`, email: `${email}`, senha: `${senha}` }),
        headers: headers
    })
    .then(resposta => {
        if (resposta.status == 201){
            alert('Usuário cadastrado com sucesso!');
            TrocarDiv('registrar', 'login');
            return true;
        } else if (resposta.status = 400){
            document.getElementById('erroEmail').innerHTML = "Já existe um usuário para este endereço de e-mail!";                     
            return false;
        } else {
            console.log(resposta);
            alert('Houve um erro ao cadastrar o usuário!');
            return false;                    
        }
    })
    .catch((erro) => {
        alert(erro.message);
        return false;
    });                
}

function RealizarLogin(){
    window.location.href = "./dashboard.html";
}