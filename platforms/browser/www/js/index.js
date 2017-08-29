server = "";
baixaArr = [];
todosArr = [];
var app = {
    initialize: function() {
        this.initFastClick();
        this.bindEvents();
        //server='http://cgnagoia.softether.net/';
        server='http://consulado.nagoia/';
        //server='http://192.168.1.190/';
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        $("#loginBtn").click(function(){
            $("#usuario").removeClass("erro");
            $("#senha").removeClass("erro");
            var usuario = $("#usuario").get(0).value;
            var senha = $("#senha").get(0).value;
            var errFlg = false;
            if (usuario.length == 0){
                $("#usuario").addClass("erro");
                errFlg = true;
            }
            if (senha.length == 0){
                $("#senha").addClass("erro");
                errFlg = true;
            }
            if (errFlg == false){
                $.ajax({
                    type: 'post',
                    url: server+'estoque/mobile.php',
                    dataType: 'json',
                    data:{
                        opt: 'login',
                        usuario: usuario,
                        senha: senha
                    },
                    success: function(json){
                        if (json > 0){
                            window.localStorage.setItem('codFunc', json);
                            $.mobile.changePage($("#main"));
                        }
                    },
                    error: function(){
                        alert ("erro");
                    }
                });
            }
        });
        $("#listaProdutos").click(function(){
            paginaOrigem = 'listaMaterial';
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: server+'estoque/mobile.php',
                data:{
                    opt: 'getListaProdutos'
                },
                success: function(json){
                    $.each(json, function(idx, field) {
                        var produto = field.Descricao;
                        var codProduto = field.CodProduto;
                        var saldo = field.Saldo;
                        $("#materialList").append('<li onclick="showProduto('+codProduto+', \'listaMaterial\');"><img style="width: 75px;" src="'+server+'Arquivos/Estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div class="quantidade" style="text-align: right;">'+saldo+'</div></li>');
                       // $("#aaa").append('<li ><img style="width: 75px;" src="'+server+'estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div style="text-align: right;">'+saldo+'</div></li>');
                        window.localStorage.setItem(codProduto, produto);
                    });
                    goto('listaMaterial');
                    //$('body').pagecontainer('change', "#listaMaterial", {transition: 'flip'});
                  //  $.mobile.changePage($("#listaMaterial"));
                    $("#materialList").listview("refresh");
                } 
            });
        });
        $("#PesquisaBCBtn").click(function(){
            app.barcode('pesquisaProduto');
        });
        $("#materialEntrega").click(function(){
            app.listaPendente();
        });
        $("#recebimentoMaterial").click(function(){
            app.produtoReceber();
        });
        $("#EntregaBCBtn").click(function(){
            app.barcode('listaPedidoProduto');
        });
        
        $("#cadastraBarcode").click(function(){
            app.barcode('cadastraNovoBarcode');
        });
        
        $("#selecioneEntrega").click(function(){
            if ($("#selecioneEntrega").hasClass('clicado')){
                baixaArr = [];
                $(".seletor i").removeClass('fa-check-square-o');
                $(".seletor i").addClass('fa-square-o');
            }else{
                baixaArr = todosArr;
                $(".seletor i").addClass('fa-check-square-o');
                $(".seletor i").removeClass('fa-square-o');
            }
            toggleBtnEntregaMaterial();
            $("#selecioneEntrega").toggleClass('clicado');
        });
        
        $("#selecionaRecebimento").click(function(){
            if ($("#selecionaRecebimento").hasClass('clicado')){
                recebimentoArr = [];
                $(".seletor i").removeClass('fa-check-square-o');
                $(".seletor i").addClass('fa-square-o');
            }else{
                recebimentoArr = todosArr;
                $(".seletor i").addClass('fa-check-square-o');
                $(".seletor i").removeClass('fa-square-o');
            }
            toggleBtnRecebimentoMaterial();
            $("#selecionaRecebimento").toggleClass('clicado');
        });
        
        $("#alteraBtn").click(function(){
            $.ajax({
                url: server+'estoque/mobile.php',
                dataType: 'html',
                type: 'POST',
                data:{
                    opt: 'alteraPedido',
                    codHistorico: baixaArr
                },
                success: function(output){
                    $("#contentJanelaAlteraPedido").html(output);
                    $("#janelaAlteraPedido").removeClass("invisivel");
                }
            });
        });
        
        $("#confirmaBtn").click(function(){
            $.ajax({
                url: server+'estoque/mobile.php',
                dataType: 'html',
                type: 'POST',
                data:{
                    opt: 'baixaPedido',
                    codHistorico: baixaArr
                },
                success: function(output){
                    if (output == true){
                        app.listaPendente();
                        app.listaPedidoProduto(barcode);
                    }
                }
            });
        });
        
        $("#confirmaRecebimentoBtn").click(function(){
            $.ajax({
                url: server+'estoque/mobile.php',
                dataType: 'html',
                type: 'POST',
                data:{
                    opt: 'entradaMaterial',
                    codPMFinal: recebimentoArr
                },
                success: function(output){
                    if (output == true){
                        app.produtoReceber();
                        app.listaEntradaProduto(barcode);
                    }
                }
            });
        });
        $("#EntradaBCBtn").click(function(){
           // app.barcodeEntradaMaterial();
            app.barcode('listaEntradaProduto');
        });
    },

    initFastClick : function() {
        window.addEventListener('load', function() {
            FastClick.attach(document.body);
        }, false);
    },

    onDeviceReady: function() {
        console.log(navigator.notification);
        if (device.platform === 'iOS'){
            StatusBar.overlaysWebView(false);
            StatusBar.backgroundColorByName("black");
        }
        
        // SQLite
//        var SQLite = window.cordova.require('cordova-sqlite-plugin.SQLite');
//        
//        
//        var sqlite = new SQLite('estoque');
        
//          sqlite.open(function(err) {
//    alert('Connection opened');
//    if (err) throw err;
//    sqlite.query('SELECT ? + ? AS solution', [2, 3], function(err, res) {
//      if (err) throw err;
//      alert(JSON.stringify(res));
//      // log(res.rows[0].solution);
//      sqlite.close(function(err) {
//        if (err) throw err;
//        alert('Connection closed');
//        SQLite.deleteDatabase('example', function(err) {
//          if (err) throw err;
//          alert('Database deleted');
//        });
//      });
//    });
//  });
        
        
        
//        sqlite.query("CREATE DATABASE IF NOT EXISTS ?",['estoque'], function(err){
//            if (err) throw err;
//            sqlite.open(function(err) {
//                if (err) throw err;
//                      // ... 
//                sqlite.query("CREATE TABLE IF NOT EXISTS Conf (?, ?)", ['server', 'usuario'], function(err){
//                    if (err) throw err;
//                    sqlite.query("INSERT INTO Conf VALUES(?, ?)", ['localhost', 'Giuliano'], function(err){
//                        if (err) throw err;
//                        sqlite.query("SELECT * FROM ?" ,['conf'], function(err, res){
//                            if (err) throw err;
//                            alert(res);
//                              console.log(res.rows[0].usuario); 
//                        });
//                    });
//                });
//            });
//        });
        
        
        
    },
    
    listaPendente: function (){
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: server+'estoque/mobile.php',
            data:{
                opt: 'getListaMaterialEntrega'
            },
            success: function(json){
                $("#materialPendente").html("");
                $.each(json, function(idx, field) {
                    var produto = field.Descricao;
                    var codProduto = field.CodProduto;
                    var saldo = field.Saldo;
                    var total = field.Total;
                    $("#materialPendente").append('<li ><img style="width: 75px;" src="'+server+'Arquivos/Estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div class="quantidade" style="text-align: right;">'+total+' ('+saldo+')</div></li>');
                });
                //$('body').pagecontainer('change', '#pendentes', {transition: 'flip'});
                goto('pendentes');
                $("#materialPendente").listview("refresh");
            }
        });
    },
    
    erro:{
        
    },
//    barcodePendentesEntrega: function(){
//      cordova.plugins.barcodeScanner.scan(
//      function (result) {
//          listaPedidoProduto(result.text);
//      },
//      function (error) {
//          alert("Erro no escaneamento: " + error);
//      },
//      {
//          preferFrontCamera : false, // iOS and Android
//          showFlipCameraButton : true, // iOS and Android
//          showTorchButton : true, // iOS and Android
//          torchOn: false, // Android, launch with the torch switched on (if available)
//          prompt : "Localize o código de barras", // Android
//          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
//          orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
//          disableAnimations : true, // iOS
//          disableSuccessBeep: false // iOS
//      }
//   );
//},
    barcode: function(op){
        cordova.plugins.barcodeScanner.scan(
        function (result) {
            switch (op){
                case 'cadastraNovoBarcode':
                    app.cadastraNovoBarcode(result.text);
                    break;
                case 'listaPedidoProduto':
                    app.listaPedidoProduto(result.text);
                    break;
                case 'listaEntradaProduto':
                    app.listaEntradaProduto(result.text);
                    break;
                case 'pesquisaProduto':
                    paginaOrigem = 'listaMaterial';
                    showProduto(result.text, 'listaMaterial');
                    break;
          }
      },
      function (error) {
          alert("Erro no escaneamento: " + error);
      },
      {
          preferFrontCamera : false, // iOS and Android
          showFlipCameraButton : true, // iOS and Android
          showTorchButton : true, // iOS and Android
          torchOn: false, // Android, launch with the torch switched on (if available)
          prompt : "Localize o código de barras", // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
//          formats : "EAN_13", // default: all but PDF_417 and RSS_EXPANDED
          orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS
      }
   );
},
    cadastraNovoBarcode: function(barcode){
    $.ajax({
        type: 'POST',
        url: server+'estoque/mobile.php',
        dataType: 'json',
        data:{
            opt: 'cadastraNovoBarcode',
            barcode: barcode
        },
        success: function(json){
            if (json.ret === true){
                showProduto(json.codProduto, paginaOrigem);
            }else{
                navigator.notification.alert(json.error+"\n", app.erro, "Aviso", "OK");
            }
        }
    });
},

//    barcodeEntradaMaterial: function(){
//      cordova.plugins.barcodeScanner.scan(
//      function (result) {
//          app.listaEntradaProduto(result.text);
//      },
//      function (error) {
//          alert("Erro no escaneamento: " + error);
//      },
//      {
//          preferFrontCamera : false, // iOS and Android
//          showFlipCameraButton : true, // iOS and Android
//          showTorchButton : true, // iOS and Android
//          torchOn: false, // Android, launch with the torch switched on (if available)
//          prompt : "Localize o código de barras", // Android
//          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
////          formats : "EAN_13", // default: all but PDF_417 and RSS_EXPANDED
//          orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
//          disableAnimations : true, // iOS
//          disableSuccessBeep: false // iOS
//      }
//   );        
//    },
    produtoReceber: function(){
        paginaOrigem = 'recebimento';
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: server+'estoque/mobile.php',
            data:{
                opt: 'getListaProdutoReceber'
            },
            success: function(json){
                $("#materialRecebimento").html("");
                $.each(json, function(idx, field) {
                    var produto = field.Descricao;
                    var codProduto = field.CodProduto;
                    var quantidade = field.Quantidade;
                    var saldo = field.Saldo;
                    var saldoFuturo = field.SaldoFuturo;
                    var credor = field.Credor;
                    $("#materialRecebimento").append('<li onclick="showProduto('+codProduto+', \''+paginaOrigem+'\');" ><img style="width: 75px;" src="'+server+'Arquivos/Estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div style="font-style: italic;">'+credor+'</div><br><div class="quantidade" style="text-align: right;">'+quantidade+' <i style="color: #26a69a;" class="fa fa-long-arrow-right" aria-hidden="true"></i>'+saldoFuturo+'</div></li>');
                });
                //$('body').pagecontainer('change', '#pendentes', {transition: 'flip'});
                goto('recebimento');
                $("#materialRecebimento").listview("refresh");
            }
        });        
    },
    listaEntradaProduto: function(barcode){
      $.ajax({
          type: 'POST',
          dataType: 'json',
          url: server+'estoque/mobile.php',
          data:{
              opt: 'getProdutoEntrada',
              barcode: barcode
          },
          success: function(json){
                recebimentoArr = [];
                todosArr = [];
                if (json.ret === false){
                    navigator.notification.alert("Material não está na lista para receber e/ou código de barras não cadastrado no sistema\n" + barcode, app.erro, "Aviso", "OK");
                }else{
                    if (json.recebimento === null){
                        app.produtoReceber();
                    }else{
                        var produto = json.dados.Descricao;
                        var codProduto = json.dados.CodProduto;
                        $("#imagemMaterialRecebimento").html('<img src="'+server+'Arquivos/Estoque/imagemProduto/'+codProduto+'.jpg"/><p>'+produto+'</p>');
                        $("#materialRecebimentoList").html('');
                        $.each(json.recebimento, function(idx, field){
                            var credor = field.Credor;
                            var setor = field.Setor;
                            var data = field.DataHistorico;
                            var codPMFinal = field.CodPMFinal;
                            var quantidade = field.Quantidade;
                            $("#materialRecebimentoList").append('<li onclick="selecionaEntrada('+codPMFinal+');" class="listaProduto"><div class="seletor" style="width: 30px; heigth: 100%;"><i id="sel'+codPMFinal+'" class="fa fa-square-o fa-2x" aria-hidden="true"></i></div><div style="font-size: 22px;" class="detalheListaPendente"><span class="apelido">'+credor+'</span><br><span class="setor">'+setor+'</span><br><span class="dataPedido">'+data+'</span><div class="quantidade">'+quantidade+'</div></div></li>');
                            todosArr.push(codPMFinal);
                        });
                        $("#totalEntradaProduto").html(json.totalRecebimento);
                        goto('materialRecebimentoPage');
                        //$.mobile.changePage($("#materialSolicitado"));
                        $("#materialRecebimentoList").listview("refresh");
                    }
                }
            }
      });         
    },
    listaPedidoProduto: function(codProduto){
      barcode = codProduto;
      $.ajax({
          type: 'POST',
          dataType: 'json',
          url: server+'estoque/mobile.php',
          data:{
              opt: 'getProdutoByCod',
              barcode: codProduto
          },
          success: function(json){
                baixaArr = [];
                todosArr = [];
                if (json.ret === false){
                    navigator.notification.alert("Material diferente do solicitado e/ou código de barras não cadastrado no sistema\n" + result.text, app.erro, "Aviso", "OK");
                }else{
                    if (json.pendentes === null){
                        app.barcode('listaPedidoProduto');
                       // app.barcodePendentesEntrega();
                    }else{
                        var produto = json.dados.Descricao;
                        var codProduto = json.dados.CodProduto;
                        var totalPendente;
                        $("#imagemMaterialSolicitado").html('<img src="'+server+'Arquivos/Estoque/imagemProduto/'+codProduto+'.jpg"/><p>'+produto+'</p>');
                        $("#materialSolicitadoList").html('');
                        $.each(json.pendentes, function(idx, field){
                            var apelido = field.Apelido;
                            var setor = field.Setor;
                            var data = field.DataHistorico;
                            var codHistorico = field.CodHistorico;
                            var quantidade = field.Quantidade;
                            $("#materialSolicitadoList").append('<li onclick="selecionaPendente('+codHistorico+');" class="listaProduto"><div class="seletor" style="width: 30px; heigth: 100%;"><i id="sel'+codHistorico+'" class="fa fa-square-o fa-2x" aria-hidden="true"></i></div><div style="font-size: 22px;" class="detalheListaPendente"><span class="apelido">'+apelido+'</span><br><span class="setor">'+setor+'</span><br><span class="dataPedido">'+data+'</span><div class="quantidade">'+quantidade+'</div></div></li>');
                            todosArr.push(codHistorico);
                        });
                        $("#totalProduto").html(json.totalPendente);
                        goto('materialSolicitado');
                        //$.mobile.changePage($("#materialSolicitado"));
                        $("#materialSolicitadoList").listview("refresh");
                    }
                }
            }
      });    
    }
};

function selecionaPendente(codHistorico){
    if ($("#sel"+codHistorico).hasClass('fa-square-o')){
        baixaArr.push(codHistorico);
    }else{
        baixaArr.splice(baixaArr.indexOf(codHistorico), 1);
    }
    toggleBtnEntregaMaterial();
    $("#sel"+codHistorico).toggleClass('fa-check-square-o');
    $("#sel"+codHistorico).toggleClass('fa-square-o');

}    

function toggleBtnEntregaMaterial(){
    if (baixaArr.length > 0){
        $("#confirmaBtn").removeClass("oculto");
        if (baixaArr.length == 1){
            $("#alteraBtn").removeClass("oculto");
        }else{
            $("#alteraBtn").addClass("oculto");
        }
    }else{
        $("#confirmaBtn").addClass("oculto");
        $("#alteraBtn").addClass("oculto");
    }
}

function selecionaEntrada(codPMFinal){
    if ($("#sel"+codPMFinal).hasClass('fa-square-o')){
        recebimentoArr.push(codPMFinal);
    }else{
        recebimentoArr.splice(recebimentoArr.indexOf(codPMFinal), 1);
    }
    toggleBtnRecebimentoMaterial();
    $("#sel"+codPMFinal).toggleClass('fa-check-square-o');
    $("#sel"+codPMFinal).toggleClass('fa-square-o');

}      
function toggleBtnRecebimentoMaterial(){
    if (recebimentoArr.length > 0){
        $("#confirmaRecebimentoBtn").removeClass("oculto");
    }else{
        $("#confirmaRecebimentoBtn").addClass("oculto");
    }
}

function fechaJanela(janela){
    if (janela == 'janelaAlteraPedido'){
        var codFunc = $("#edtCodFuncPedido").get(0).value;
        var codSetor = $("#edtCodSetorPedido").get(0).value;
        var qtd = $("#edtQtdPedido").get(0).value;
        $.ajax({
            type: 'POST',
            url: server+'estoque/mobile.php',
            data: {
                opt: 'gravaAlteracaoPedido',
                codFunc: codFunc,
                codSetor: codSetor,
                qtd: qtd
            },
            dataType: 'json',
            success: function(json){
                if (json.ret == true){
                    app.listaPedidoProduto(json.codProduto);
                    $("#"+janela).addClass("invisivel");
                }else{
                     navigator.notification.alert(json.error, erro, "Aviso", "OK");
                }
            }
        });
    }else{
        $("#"+janela).addClass("invisivel");
    }
}

function goto(page){
    $('body').pagecontainer('change', '#'+page, {transition: 'slide', reverse: false});    
}

function goback(page){
    if (page === undefined){
        page = paginaAnterior;
    }
    $('body').pagecontainer('change', '#'+page, {transition: 'slide', reverse: true});    
}

function showProduto(codProduto, pagina){
    paginaAnterior = pagina;
    $.ajax({
        type: 'POST',
        url: server+'estoque/mobile.php',
        data: {
            opt: 'showProduto',
            codProduto: codProduto
        },
        dataType: 'json',
        success: function(json){
            if (json.ret == true){
                $("#imagemTelaProduto").html('<img style="width: 75%;" src="'+server+'Arquivos/Estoque/imagemProduto/'+json.produto.CodProduto+'.jpg"/>');
                var html = '<input class="produtoInput" type="text" value="'+json.produto.Descricao+'" />';
                html = html + '<p class="labelPequeno">Saldo</p>';
                html = html + '<p class="barcode">'+json.produto.Saldo+' '+json.produto.Unidade+'</p>';
                html = html + '<p class="labelPequeno">Código de barras</p>';
                $.each(json.barcode, function(idx, field){
                    html = html + '<p class="barcode">'+field.Barcode+'</p>';
                });
                $("#detalheProduto").html(html);
                goto('telaProduto');
            }else{
                 navigator.notification.alert(json.error, erro, "Aviso", "OK");
            }
        }    
    });    
    
}