function TrocarDiv(divAtual, divNova) {
    let DivAtual = document.getElementById(divAtual); 
    DivAtual.style.display = 'none';
    
    let DivNova = document.getElementById(divNova);
    DivNova.style.display = 'block';

    return false;
}

function ResetarErrosRegistro(){
    document.getElementById('erroEmail').innerHTML = "";
    document.getElementById('erroSenha').innerHTML = "";
    document.getElementById('erroSenhaConfirma').innerHTML = "";
}

function ValidarUsuario(){
    let Email = document.forms["FormRegistro"]["txtEmailRegistro"].value;
    let Senha = document.forms["FormRegistro"]["txtSenhaRegistro"].value;
    let SenhaConfirma = document.forms["FormRegistro"]["txtSenhaConfirma"].value;
    let Sucesso = true;

    ResetarErrosRegistro();

    if (Email.length < 1){
        document.getElementById('erroEmail').innerHTML = "Informe um e-mail para registrar o usuário!";
        Sucesso = false;
    }

    if (Senha.length < 1){
        document.getElementById('erroSenha').innerHTML = "Informe uma senha para o seu usuário!";
        Sucesso = false;
    }
    
    if (SenhaConfirma.length < 1){
        document.getElementById('erroSenhaConfirma').innerHTML = "Confirme a senha informada!";
        Sucesso = false;
    }

    if (Senha != SenhaConfirma){
        document.getElementById('erroSenhaConfirma').innerHTML = "As senhas informadas não são iguais!";
        Sucesso = false;
    }

    return Sucesso;
}

function CadastrarUsuario(){
    if (ValidarUsuario() == false)
        return false;

    
}