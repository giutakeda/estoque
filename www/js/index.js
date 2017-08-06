server = "";
var app = {
     
    initialize: function() {
        this.initFastClick();
        this.bindEvents();
        server='http://cgnagoia.softether.net/';
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
                        $("#materialList").append('<li ><img style="width: 75px;" src="'+server+'estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div style="text-align: right;">'+saldo+'</div></li>');
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
                        $("#materialPendente").append('<li ><img style="width: 75px;" src="'+server+'estoque/imagemProduto/'+codProduto+'.jpg"/>'+produto+'<br><div style="text-align: right;">'+saldo+'</div></li>');
                    });
                    $('body').pagecontainer('change', '#pendentes', {transition: 'flip'});
                    $("#materialPendente").listview("refresh");
                }
            });
        });
        $("#EntregaBCBtn").click(function(){
          //  alert ("abc");
           // alert (window.localStorage.getItem('codFunc'));
            app.barcodePendentesEntrega();
        });
        
        $("#selecioneEntrega").click(function(){
            if ($("#selecioneEntrega").hasClass('clicado')){
                $("#materialSolicitadoList i").addClass('invisivel');
            }else{
                $("#materialSolicitadoList i").removeClass('invisivel');
            }
            $("#selecioneEntrega").toggleClass('clicado');
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
    
    erro:{
        
    },
    
    barcodePendentesEntrega: function(){
      cordova.plugins.barcodeScanner.scan(
      function (result) {
          $.ajax({
              type: 'POST',
              dataType: 'json',
              url: server+'estoque/mobile.php',
              data:{
                  opt: 'getProdutoByCod',
                  barcode: result.text
              },
              success: function(json){
                    if (json.ret == false){
                        navigator.notification.alert("Material diferente do solicitado e/ou código de barras não cadastrado no sistema\n" + result.text, app.erro, "Aviso", "OK");
                    }else{
//                        alert (JSON.stringify(json.pendentes));
                        var produto = json.dados.Descricao;
                        var codProduto = json.dados.CodProduto;
                        var totalPendente;
                        $("#imagemMaterialSolicitado").html('<img style="width: 75%; margin: 0px auto;" src="'+server+'estoque/imagemProduto/'+codProduto+'.jpg"/><p style="text-align: center; margin-top: 0px;">'+produto+'</p>');
                        $("#materialSolicitadoList").html('');
                        $.each(json.pendentes, function(idx, field){
                            var apelido = field.Apelido;
                            var setor = field.Setor;
                            var data = field.DataHistorico;
                            var quantidade = field.Quantidade;
                            $("#materialSolicitadoList").append('<li class="listaProduto apagar"><div class="seletor" style="width: 30px; heigth: 100%;"><i class="invisivel fa fa-circle-o fa-2x" aria-hidden="true"></i></div><div class="detalheListaPendente"><span style="font-style: italic; font-weigth: bold;">'+apelido+'</span><br>'+setor+'<br>'+data+'<br>'+quantidade+'<br></div><div class="apagarBtn"><button class="apagar"><i class="fa fa-trash fa-3x" aria-hidden="true"></i></button></div></li>');
                        });
                        $("#totalPendente").html(json.totalPendente);
                        $("#materialSolicitadoList").on("swipeleft", function(event){
                            $(event.target).removeClass('apagar');
                          //  $(this).removeClass('apagar');
                        });
                        $("#materialSolicitadoList li").on("swiperight", function(event){
                            $(event.target).addClass('apagar');
                        });
                        $.mobile.changePage($("#materialSolicitado"));
                        $("#materialSolicitadoList").listview("refresh");
                    }
                }
          });
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