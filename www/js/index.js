server = "";
baixaArr = [];
todosArr = [];
var app = {
     
    initialize: function() {
        this.initFastClick();
        this.bindEvents();
        //server='http://cgnagoia.softether.net/';
        //server='http://consulado.nagoia/';
        server='http://192.168.1.190/';
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
                        $("#materialList").append('<li ><img style="width: 75px;" src="'+server+'Arquivos/Estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div style="text-align: right;">'+saldo+'</div></li>');
                       // $("#aaa").append('<li ><img style="width: 75px;" src="'+server+'estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div style="text-align: right;">'+saldo+'</div></li>');
                        window.localStorage.setItem(codProduto, produto);
                    });
                    $('body').pagecontainer('change', "#listaMaterial", {transition: 'flip'});
                  //  $.mobile.changePage($("#listaMaterial"));
                    $("#materialList").listview("refresh");
                } 
            });
        });
        $("#materialEntrega").click(function(){
            app.listaPendente();
        });
        $("#EntregaBCBtn").click(function(){
          //  alert ("abc");
           // alert (window.localStorage.getItem('codFunc'));
            app.barcodePendentesEntrega();
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
                        listaPedidoProduto(barcode);
                    }
                }
            });
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
        }
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
                    $("#materialPendente").append('<li ><img style="width: 75px;" src="'+server+'Arquivos/Estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div style="text-align: right;">'+saldo+'</div></li>');
                });
                $('body').pagecontainer('change', '#pendentes', {transition: 'flip'});
                $("#materialPendente").listview("refresh");
            }
        });
    },
    
    erro:{
        
    },
    
    barcodePendentesEntrega: function(){
      cordova.plugins.barcodeScanner.scan(
      function (result) {
          listaPedidoProduto(result.text);
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
}
};

function listaPedidoProduto(codProduto){
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
                if (json.ret == false){
                    navigator.notification.alert("Material diferente do solicitado e/ou código de barras não cadastrado no sistema\n" + result.text, app.erro, "Aviso", "OK");
                }else{
                    if (json.pendentes === null){
                        app.barcodePendentesEntrega();
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
                        $.mobile.changePage($("#materialSolicitado"));
                        $("#materialSolicitadoList").listview("refresh");
                    }
                }
            }
      });    
}


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
                    listaPedidoProduto(json.codProduto);
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
    
    $('body').pagecontainer('change', '#'+page, {transition: 'flip'});    
    
}