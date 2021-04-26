function InicializarDashBoard(){
    let conteudo = sessionStorage.getItem("usuario");
    
    if (conteudo == null) {
        alert('Você não realizou o login!\nRetornado à página de login...');
        window.location.href = "./index.html";
        return false;
    } else{
        let usuario = JSON.parse(conteudo);

        document.getElementById('boasVindas').innerHTML = `Olá ${usuario.nome}, bem vindo(a) ao controle de gastos!`;

        google.charts.load('current', {
          packages: ['corechart', 'line'],
          callback: DesenharGraficos
        });
    }

    document.getElementById("defaultTab").click();
    return true;
}

function DesenharGraficos(){
  if ((typeof google === 'undefined') || (typeof google.visualization === 'undefined')) 
    return;

  GerarGraficoPizzaOuColuna('pizza', 'categorias', 'categoria', 'categoriaPizza', 'erroCategoriaPizza');
  GerarGraficoPizzaOuColuna('coluna', 'categorias', 'categoria', 'categoriaColuna', 'erroCategoriaColuna');
  GerarGraficoLinhas('categorias', 'categoria', 'categoriaLinha', 'erroCategoriaLinha');
  GerarGraficoPizzaOuColuna('pizza', 'meiospagamento', 'meio de pagamento', 'meiosPizza', 'erroMeiosPizza');
  GerarGraficoPizzaOuColuna('coluna', 'meiospagamento', 'meio de pagamento', 'meiosColuna', 'erroMeiosColuna');
  GerarGraficoLinhas('meiospagamento', 'meio de pagamento', 'meiosLinha', 'erroMeiosLinha');
}

function AbrirTab(evento, nomeTab) {
    let i;
  
    let tab = document.getElementsByClassName("tab");
    for (i = 0; i < tab.length; i++) {
      tab[i].style.display = "none";
    }
  
    let botao = document.getElementsByClassName("tabLink");
    for (i = 0; i < botao.length; i++) {
      botao[i].className = botao[i].className.replace(" active", "");
    }
  
    document.getElementById(nomeTab).style.display = "block";
    evento.currentTarget.className += " active";

    switch(nomeTab){
      case 'dashboard':
        DesenharGraficos();
        break;
      case 'listarMeiosPgto':
        AlternarTabMeioPgto('divListaMeiosPagamento', null, null);
        break;
      case 'listarCategorias':
        AlternarTabCategoria('divListaCategorias', null, null);
        break;
    }
} 

function AlternarTabMeioPgto(nomeTab, id, descricao){
  document.getElementById('divListaMeiosPagamento').style.display = "none";
  document.getElementById('divAlteracaoMeiosPagamento').style.display = "none";

  document.getElementById(nomeTab).style.display = "block";
  
  switch(nomeTab){
    case 'divListaMeiosPagamento':
      ListarMeiosPagamento();
      break;
    case 'divAlteracaoMeiosPagamento':
      AlterarMeioPagamento(id, descricao);
      break;
  }
}

function AlternarTabCategoria(nomeTab, id, descricao){
  document.getElementById('divListaCategorias').style.display = "none";
  document.getElementById('divAlteracaoCategorias').style.display = "none";  

  document.getElementById(nomeTab).style.display = "block";
  
  switch(nomeTab){
    case 'divListaCategorias':
      ListarCategorias();
      break;
    case 'divAlteracaoCategorias':
      AlterarCategoria(id, descricao);
      break;
  }
}

function Deslogar(){
    if (confirm("Deseja realmente sair?")) {
        sessionStorage.removeItem("usuario");
        window.location.href = "./index.html";
    };
}

function GerarGraficoPizzaOuColuna(tipo, url, titulo, div, spanErro){
  fetch(`http://localhost:5000/api/dashboard/graficos/pizza/${url}`)
  .then(resposta => {
      resposta.json()
      .then((json) => {
          if (resposta.status == 200){
            let data = new google.visualization.DataTable();
            data.addColumn('string', 'Quebra');
            data.addColumn('number', 'Valor');

            json.forEach((item) => {
              data.addRows([[item.descricao, item.valor]]);
            });
            
            if (tipo == 'pizza'){
              var options = {
                legend: { position: 'bottom' },
                tooltip: { text : 'percentage' },
                title: `Compras neste mês por ${titulo}`,
                width: 400,
                height: 400,
                is3D: true
              };
          
              var chart = new google.visualization.PieChart(document.getElementById(div));
            } else {
              var options = {
                title: `Compras neste mês por ${titulo}`,
                width: 400,
                height: 400,
                legend: { position: "none" }
              };            
  
              var chart = new google.visualization.ColumnChart(document.getElementById(div));
            }            
            chart.draw(data, options);              
          } else {
              document.getElementById(spanErro).innerHTML = json.erro;
              return false;                    
          }
      }); 
  })
  .catch((erro) => {
      document.getElementById(spanErro).innerHTML = erro.message;
      return false;
  });
}

function GerarGraficoLinhas(url, titulo, div, spanErro){
  fetch(`http://localhost:5000/api/dashboard/graficos/linhas/${url}`)
  .then(resposta => {
      resposta.json()
      .then((json) => {
          if (resposta.status == 200){       
            let data = new google.visualization.DataTable();
            data.addColumn("string", "ano-mes");

            json.series.forEach(item => {
              data.addColumn('number', item);
            });            

            json.valores.forEach(item => {
              data.addRows([item]);
            });
            
            let options = {
              title: `Evolução dos gastos nos últimos 6 meses por ${titulo}`,
              curveType: 'function',
              width: 400,
              height: 400,
              legend: { position: 'bottom' }
            };
          
            let chart = new google.visualization.LineChart(document.getElementById(div));          
            chart.draw(data, options);              
          } else {
              document.getElementById(spanErro).innerHTML = json.erro;
              return false;                    
          }
      }); 
  })
  .catch((erro) => {
      document.getElementById(spanErro).innerHTML = erro.message;
      return false;
  });
}

function ListarMeiosPagamento(){
  let tabelaAtual = document.getElementById('tabelaMeiosPgto').getElementsByTagName('tbody')[0];
  let novaTabela = document.createElement('tbody');
  let usuario = JSON.parse(sessionStorage.getItem("usuario"));

  fetch(`http://localhost:5000/api/meiospagamento/?id_usuario=${usuario.id}`)
  .then(resposta => {
      resposta.json()
      .then((json) => {
          if (resposta.status == 200){
            json.forEach((item) => {
              let novaLinha = novaTabela.insertRow();

              let celDescricao = novaLinha.insertCell();
              let celEditar = novaLinha.insertCell();
              let celExcluir = novaLinha.insertCell();
            
              celDescricao.innerHTML = item.descricao;
              celDescricao.style = "padding: 5px";              
              
              celEditar.innerHTML = `<span class="tabLink" width="50px" onclick="return AlternarTabMeioPgto('divAlteracaoMeiosPagamento', ${item.id}, '${item.descricao}');"><img src="./assets/tabela_editar.png"></img></span>`;
              celExcluir.innerHTML = `<span class="tabLink" width="50px" onclick="return ExcluirMeioPagamento(${item.id}, '${item.descricao}');"><img src="./assets/tabela_excluir.png"></img></span>`;
            });             
          } else {
              console.log(json.erro);
              return false;                    
          }
      }); 
  })
  .catch((erro) => {
      console.log(erro.message);
      return false;
  });

  tabelaAtual.parentNode.replaceChild(novaTabela, tabelaAtual);
}

function AlterarMeioPagamento(id, descricao){
  if (id == null){
    sessionStorage.removeItem('meioPagamentoId');
    document.forms['formMeioPagamento']['txtDescricaoMeioPagamento'].value = '';
  } else{
    sessionStorage.setItem('meioPagamentoId', id);
    document.forms['formMeioPagamento']['txtDescricaoMeioPagamento'].value = descricao;
  }

  document.getElementById('erroMeioPagamento').innerHTML = '';
}

function SalvarMeioPagamento(){
  let id = sessionStorage.getItem('meioPagamentoId');
  let descricao = document.forms["formMeioPagamento"]["txtDescricaoMeioPagamento"].value;
  let usuario = JSON.parse(sessionStorage.getItem("usuario"));

  let headers = new Headers();
  headers.append("Content-Type", "application/json");

  if (id == null){
    fetch("http://localhost:5000/api/meiospagamento/", {
        method: "POST",
        body: JSON.stringify({ descricao: `${descricao}`, id_usuario: `${usuario.id}` }),
        headers: headers
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            if (resposta.status == 201){
              CancelarAlteracaoMeioPagamento();    
            } else{
              if (resposta.status = 400){
                document.getElementById('erroMeioPagamento').innerHTML = conteudo.erro;
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao salvar o meio de pagamento!');
                return false;                    
              }
            }
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao salvar o meio de pagamento! \n' + erro.message);
        return false;
    }); 
  } else {
    fetch(`http://localhost:5000/api/meiospagamento/${id}`, {
        method: "PUT",
        body: JSON.stringify({ descricao: `${descricao}`, id_usuario: `${usuario.id}` }),
        headers: headers
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            if (resposta.status == 200){
              CancelarAlteracaoMeioPagamento();    
            } else{
              if (resposta.status = 400){
                document.getElementById('erroMeioPagamento').innerHTML = conteudo.erro;
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao salvar o meio de pagamento!');
                return false;                    
              }
            } 
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao salvar o meio de pagamento! \n' + erro.message);
        return false;
    }); 
  }  
}

function ExcluirMeioPagamento(id, descricao){
  if (confirm(`Deseja realmente eliminar o meio de pagamento "${descricao}"?`)) {
    let usuario = JSON.parse(sessionStorage.getItem("usuario"));

    fetch(`http://localhost:5000/api/meiospagamento/${id}?id_usuario=${usuario.id}`, {
        method: "DELETE"
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            if (resposta.status == 200){
              CancelarAlteracaoMeioPagamento();    
            } else {
              if (resposta.status = 400){
                alert(conteudo.erro)
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao eliminar o meio de pagamento!');
                return false;                    
              }
            }
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao eliminar o meio de pagamento! \n' + erro.message);
        return false;
    });     
  };
}

function CancelarAlteracaoMeioPagamento(){
  sessionStorage.removeItem('meioPagamentoId');
  AlternarTabMeioPgto('divListaMeiosPagamento', null, null); 
}

function ListarCategorias(){
  let tabelaAtual = document.getElementById('tabelaCategorias').getElementsByTagName('tbody')[0];
  let novaTabela = document.createElement('tbody');
  let usuario = JSON.parse(sessionStorage.getItem("usuario"));

  fetch(`http://localhost:5000/api/categorias/?id_usuario=${usuario.id}`)
  .then(resposta => {
      resposta.json()
      .then((json) => {
          if (resposta.status == 200){
            json.forEach((item) => {
              let novaLinha = novaTabela.insertRow();

              let celDescricao = novaLinha.insertCell();
              let celEditar = novaLinha.insertCell();
              let celExcluir = novaLinha.insertCell();
            
              celDescricao.innerHTML = item.descricao;
              celDescricao.style = "padding: 5px";              
              
              celEditar.innerHTML = `<span class="tabLink" width="50px" onclick="return AlternarTabCategoria('divAlteracaoCategorias', ${item.id}, '${item.descricao}');"><img src="./assets/tabela_editar.png"></img></span>`;
              celExcluir.innerHTML = `<span class="tabLink" width="50px" onclick="return ExcluirCategoria(${item.id}, '${item.descricao}');"><img src="./assets/tabela_excluir.png"></img></span>`;
            });             
          } else {
              console.log(json.erro);
              return false;                    
          }
      }); 
  })
  .catch((erro) => {
      console.log(erro.message);
      return false;
  });

  tabelaAtual.parentNode.replaceChild(novaTabela, tabelaAtual);
}

function AlterarCategoria(id, descricao){
  if (id == null){
    sessionStorage.removeItem('CategoriaId');
    document.forms['formCategoria']['txtDescricaoCategoria'].value = '';
  } else{
    sessionStorage.setItem('CategoriaId', id);
    document.forms['formCategoria']['txtDescricaoCategoria'].value = descricao;
  }

  document.getElementById('erroCategoria').innerHTML = '';
}

function SalvarCategoria(){
  let id = sessionStorage.getItem('CategoriaId');
  let descricao = document.forms["formCategoria"]["txtDescricaoCategoria"].value;
  let usuario = JSON.parse(sessionStorage.getItem("usuario"));

  let headers = new Headers();
  headers.append("Content-Type", "application/json");

  if (id == null){
    fetch("http://localhost:5000/api/categorias/", {
        method: "POST",
        body: JSON.stringify({ descricao: `${descricao}`, id_usuario: `${usuario.id}` }),
        headers: headers
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            if (resposta.status == 201){
              CancelarAlteracaoCategoria();    
            } else{
              if (resposta.status = 400){
                document.getElementById('erroCategoria').innerHTML = conteudo.erro;
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao salvar a categoria!');
                return false;                    
              }
            }
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao salvar a categoria! \n' + erro.message);
        return false;
    }); 
  } else {
    fetch(`http://localhost:5000/api/categorias/${id}`, {
        method: "PUT",
        body: JSON.stringify({ descricao: `${descricao}`, id_usuario: `${usuario.id}` }),
        headers: headers
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            if (resposta.status == 200){
              CancelarAlteracaoCategoria();    
            } else{
              if (resposta.status = 400){
                document.getElementById('erroCategoria').innerHTML = conteudo.erro;
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao salvar a categoria!');
                return false;                    
              }
            } 
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao salvar a categoria! \n' + erro.message);
        return false;
    }); 
  }  
}

function ExcluirCategoria(id, descricao){
  if (confirm(`Deseja realmente eliminar a categoria "${descricao}"?`)) {
    let usuario = JSON.parse(sessionStorage.getItem("usuario"));

    fetch(`http://localhost:5000/api/categorias/${id}?id_usuario=${usuario.id}`, {
        method: "DELETE"
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            if (resposta.status == 200){
              CancelarAlteracaoCategoria();    
            } else {
              if (resposta.status = 400){
                alert(conteudo.erro)
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao eliminar a categoria!');
                return false;                    
              }
            }
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao eliminar a categoria! \n' + erro.message);
        return false;
    });     
  };
}

function CancelarAlteracaoCategoria(){
  sessionStorage.removeItem('CategoriaId');
  AlternarTabCategoria('divListaCategorias', null, null); 
}