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
      case 'listarCompras':
        AlternarTabCompra('divListaCompras', null);
        break;
      case 'listarMeiosPgto':
        AlternarTabMeioPgto('divListaMeiosPagamento', null, null);
        break;
      case 'listarCategorias':
        AlternarTabCategoria('divListaCategorias', null, null);
        break;
    }
} 

function AlternarTabCompra(nomeTab, id, descricao){
  document.getElementById('divListaCompras').style.display = "none";
  document.getElementById('divAlteracaoCompras').style.display = "none";

  document.getElementById(nomeTab).style.display = "block";
  
  switch(nomeTab){
    case 'divListaCompras':
      ListarCompras();
      break;
    case 'divAlteracaoCompras':
      AlterarCompra(id);
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

function ListarCompras(){
  let tabelaAtual = document.getElementById('tabelaCompras').getElementsByTagName('tbody')[0];
  let novaTabela = document.createElement('tbody');
  let usuario = JSON.parse(sessionStorage.getItem("usuario"));

  fetch(`http://localhost:5000/api/compras/?id_usuario=${usuario.id}`)
  .then(resposta => {
      resposta.json()
      .then((json) => {
          if (resposta.status == 200){
            json.forEach((item) => {
              let novaLinha = novaTabela.insertRow();

              let celDescricao = novaLinha.insertCell();
              let celDataCompra = novaLinha.insertCell();
              let celCategoria = novaLinha.insertCell();
              let celMeioPagamento = novaLinha.insertCell();
              let celTotal = novaLinha.insertCell();
              let celParcelas = novaLinha.insertCell();
              let celEditar = novaLinha.insertCell();
              let celExcluir = novaLinha.insertCell();
            
              celDescricao.innerHTML = item.descricao;
              celDescricao.style = "padding: 5px";

              celDataCompra.innerHTML = item.dataCompra.toString().substring(8, 10) + '/' + item.dataCompra.toString().substring(5, 7) + '/' + item.dataCompra.toString().substring(0, 4);
              celDataCompra.style = "text-align: center";              

              celCategoria.innerHTML = item.categoria.descricao;
              celCategoria.style = "padding: 5px text-align: left";

              celMeioPagamento.innerHTML = item.meioPagamento.descricao;
              celMeioPagamento.style = "padding: 5px text-align: left";  

              celTotal.innerHTML = item.total.toFixed(2).toString().replace(',', '').replace('.', ',');
              celTotal.style = "text-align: right";

              celParcelas.innerHTML = item.parcelas.length;
              celParcelas.style = "text-align: center";
              
              celEditar.innerHTML = `<span class="tabLink" width="50px" onclick="return AlternarTabCompra('divAlteracaoCompras', ${item.id});"><img src="./assets/tabela_editar.png"></img></span>`;
              celExcluir.innerHTML = `<span class="tabLink" width="50px" onclick="return ExcluirCompra(${item.id});"><img src="./assets/tabela_excluir.png"></img></span>`;
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

function AlterarCompra(id){
  if (id == null){
    sessionStorage.removeItem('CompraId');    
  } else{
    sessionStorage.setItem('CompraId', id);    
  }

  PreencherLista('selectCategoriaCompra', 'categorias', () => {
    PreencherLista('selectMeioCompra', 'meiospagamento', () => {
      prepararTelaCompra(id);
    });
  });

  prepararTelaCompra(id);  
}

function prepararTelaCompra(id){
  let tabelaAtual = document.getElementById('tabelaParcelas').getElementsByTagName('tbody')[0];
  let novaTabela = document.createElement('tbody');
  tabelaAtual.parentNode.replaceChild(novaTabela, tabelaAtual);
    
  document.getElementById('erroCompra').innerHTML = '';

  if (id == null){
    document.forms['formCompra']['txtDescricaoCompra'].value = '';
    document.forms['formCompra']['txtdataCompra'].value = formatarData(new Date());    
  } else {
    let usuario = JSON.parse(sessionStorage.getItem("usuario"));

    fetch(`http://localhost:5000/api/compras/${id}?id_usuario=${usuario.id}`)
    .then(resposta => {
        resposta.json()
        .then((json) => {
            if (resposta.status == 200){
              document.forms['formCompra']['txtDescricaoCompra'].value = json.descricao;
              document.forms['formCompra']['txtdataCompra'].value = json.dataCompra.toString().substring(0, 10);              

              document.getElementById('selectCategoriaCompra').value = json.categoria.id;
              document.getElementById('selectMeioCompra').value = json.meioPagamento.id;

              json.parcelas.forEach(item => {
                AdicionarParcela(item.dataVencimento, item.valor);  
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
  }
}

function PreencherLista(idSelect, url, callback){
  let select = document.getElementById(idSelect);  
  let usuario = JSON.parse(sessionStorage.getItem("usuario"));
  
  select.options.length = 0;
  
  fetch(`http://localhost:5000/api/${url}/?id_usuario=${usuario.id}`)
  .then(resposta => {
    resposta.json()
    .then((json) => {
      if (resposta.status == 200){
        json.forEach((item) => {
          let opcao = document.createElement('option');
  
          opcao.value = item.id;
          opcao.innerHTML = item.descricao;
  
          select.appendChild(opcao);                
        });             

        callback();
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
}

function CancelarAlteracaoCompra(){
  sessionStorage.removeItem('CompraId');
  AlternarTabCompra('divListaCompras', null); 
}

function formatarData(data) {
  let temp = new Date(data);
  let mes = '' + (temp.getMonth() + 1);
  let dia = '' + temp.getDate();
  let ano = temp.getFullYear();

  if (mes.length < 2) 
    mes = '0' + mes;
  
  if (dia.length < 2) 
    dia = '0' + dia;

  return [ano, mes, dia].join('-');
}

function AdicionarParcela(dataVencimento, valor){
  let tabela = document.getElementById('tabelaParcelas').getElementsByTagName('tbody')[0];
  let novaLinha = tabela.insertRow();
  novaLinha.id = 'parcela_' + tabela.rows.length;

  let celDataVencimento = novaLinha.insertCell();
  let celValor = novaLinha.insertCell();
  let celExcluir = novaLinha.insertCell();

  let txtDataVencimento = document.createElement('input');
  txtDataVencimento.type = 'date';
  if (dataVencimento == null)
    txtDataVencimento.value = formatarData(new Date());
  else
    txtDataVencimento.value = formatarData(dataVencimento);
  celDataVencimento.appendChild(txtDataVencimento);

  let txtValor = document.createElement('input');
  txtValor.type = 'number';
  txtValor.min = 1;
  txtValor.step = 'any';
  if (valor != null)
    txtValor.value = valor;
  celValor.appendChild(txtValor);
      
  celExcluir.innerHTML = `<span class="tabLink2" display:table; margin:0 auto; width="16px" onclick="return ExcluirParcela('${novaLinha.id}')"><img src="./assets/parcela_excluir.png"></img></span>`;
}

function ExcluirParcela(id){
  document.getElementById(id).remove();
}

function ExcluirCompra(id){
  if (confirm(`Deseja realmente eliminar esta compra?`)) {
    let usuario = JSON.parse(sessionStorage.getItem("usuario"));

    fetch(`http://localhost:5000/api/compras/${id}?id_usuario=${usuario.id}`, {
        method: "DELETE"
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            console.log(resposta);
            console.log(conteudo);
            if (resposta.status == 200){
              CancelarAlteracaoCompra();    
            } else {
              if (resposta.status = 400){
                alert(conteudo.erro)
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao eliminar a compra!');
                return false;                    
              }
            }
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao eliminar a compra! \n' + erro.message);
        return false;
    });     
  };
}

function SalvarCompra(){
  let id = sessionStorage.getItem('CompraId');
  let usuario = JSON.parse(sessionStorage.getItem("usuario"));

  let soma = 0;
  let tempParcelas = [];
  let linhas = document.querySelectorAll('#tabelaParcelas tbody tr');

  for (let i = 0; i < linhas.length; i++) {
    tempParcelas.push({
      dataVencimento: linhas[i].cells[0].children[0].value,
      valor: parseFloat((linhas[i].cells[1].children[0].value || 0))
    });   
    
    soma += parseFloat((linhas[i].cells[1].children[0].value || 0));
  }

  let compra = {
    descricao: document.forms["formCompra"]["txtDescricaoCompra"].value,
    dataCompra: document.forms["formCompra"]["txtdataCompra"].value,
    categoria: { id: parseInt(document.forms["formCompra"]["selectCategoriaCompra"].value) },
    meioPagamento: { id: parseInt(document.forms["formCompra"]["selectMeioCompra"].value) },
    total: soma,
    parcelas: tempParcelas,
    idUsuario: usuario.id
  };    

  console.log(compra);

  let headers = new Headers();
  headers.append("Content-Type", "application/json");

  if (id == null){
    fetch("http://localhost:5000/api/compras/", {
        method: "POST",
        body: JSON.stringify(compra),
        headers: headers
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            if (resposta.status == 201){
              CancelarAlteracaoCompra();    
            } else{
              if (resposta.status = 400){
                document.getElementById('erroCompra').innerHTML = conteudo.erro;
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao salvar a compra!');
                return false;                    
              }
            }
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao salvar a compra! \n' + erro.message);
        return false;
    }); 
  } else {
    fetch(`http://localhost:5000/api/compras/${id}`, {
        method: "PUT",
        body: JSON.stringify(compra),
        headers: headers
    })
    .then(resposta => {
        resposta.json()
        .then((conteudo) => {
            if (resposta.status == 200){
              CancelarAlteracaoCompra();    
            } else{
              if (resposta.status = 400){
                document.getElementById('erroCompra').innerHTML = conteudo.erro;
                return false;                            
              } else {
                console.log(resposta);
                alert('Houve um erro ao salvar a compra!');
                return false;                    
              }
            } 
        }); 
    })
    .catch((erro) => {
        alert('Houve um erro ao salvar a compra! \n' + erro.message);
        return false;
    }); 
  }    
}