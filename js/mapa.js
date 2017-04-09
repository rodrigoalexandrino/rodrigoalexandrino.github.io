var map;
var infoBox = [];
var markers = [];
/**
 * @author Rodrigo Alexandrino
 * Inicia o mapa na posição 0,0
 */
function initialize() {
    var latlng = new google.maps.LatLng(0, 0);

    var options = {
        zoom: 5,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
    };

    map = new google.maps.Map(document.getElementById("mapa"), options);
}

/**
 * * @author Rodrigo Alexandrino
 * Ler o arquivo json
 */
function carregarPontos(filtro) {

    initialize();

    if(filtro == 0){
        $.getJSON('js/pontos.json', function (pontos) {
            var latlngbounds = new google.maps.LatLngBounds();
            lerArray(pontos);
        });
    }else{
        lerArray(filtro);       
    }

}
/**
 * cria os pontos no mapa
 * @param  {array} pontos formato JSON
 * @return {[type]}
 */
function lerArray(pontos){
    //extremidades do mapa
    var latlngbounds = new google.maps.LatLngBounds();
    //equivalente ao for
        $.each(pontos, function (index, ponto) {

            //criação do marcador
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(ponto.Latitude, ponto.Longitude),
                title: ponto.Universidade + " - " + ponto.Sigla,
                icon: 'img/marcador.png'
            });

            var myOptions = {
                content: "<p>" + ponto.Universidade + "</p>",
                pixelOffset: new google.maps.Size(-150, 0)
            };

            infoBox[ponto.Codigo] = new InfoBox(myOptions);
            infoBox[ponto.Codigo].marker = marker;

            //listener do clique no marcador
            infoBox[ponto.Codigo].listener = google.maps.event.addListener(marker, 'click', function (e) {
                $("#universidade").html(ponto.Universidade + " - " + ponto.Sigla);
                $("#programa").html('<b>Curso:</b> '+ ponto.Curso);
                $("#codigo_programa").html("<b>Código:</b> "+ ponto.Codigo);
                $("#pagina").html("<b>Página:</b> <a target=\"_blank\" href=\"" + ponto.Pagina +"\"\>" + ponto.Pagina +"</a>");
                $("#cidade").html("<b>Cidade/UF:</b> "+ ponto.Cidade + " / " + ponto.UF);
                $("#docentes").html("<b>Docentes:</b> "+ ponto.Docentes_Permanentes);
                $("#ano").html("<b>Ano Criação:</b> "+ ponto.Ano_Criacao);
                $("#qtde_mestrado").html("<b>Egressos Mestrado:</b> "+ ponto.Qtd_egresso_Mestrado);
                $("#qtde_doutorado").html("<b>Egressos Doutorado:</b> "+ ponto.Qtd_egresso_Doutorado);
                $("#bolsistas").html("<b>Bolsistas:</b> "+ ponto.Bolsistas);


                var linhasHTML = "<b>Linhas de Pesquisa:</b>";
                linhasHTML += '<ul>';
                $("#linhas_pesquisa").html(+ ponto.Linhas_de_Pesquisa);
                $.each(ponto.Linhas_de_Pesquisa, function (i, linha) {
                    linhasHTML += "<li>"+ linha.descricao +"</li>";
                });

                linhasHTML += '</ul>';
                $("#linhas_pesquisa").html(linhasHTML);
                $('#myModal').modal('open');
            });

            //adicionar no mapa
            markers.push(marker);

            //fixar no mapa
            marker.setMap(map);
            latlngbounds.extend(marker.position);
        });
        map.fitBounds(latlngbounds);
}

function insereLinhasPesquisa(){
    $('#select_linhas_pesquisa').material_select();
    var linhas_pesquisa = [];
    $.getJSON('js/pontos.json', function (pontos) {
        $.each(pontos, function (index, ponto) {
            $.each(ponto.Linhas_de_Pesquisa, function (i, linha) {
                var descricao = String(linha.descricao);
                lLen = linhas_pesquisa.length;
                if(linhas_pesquisa.length == 0){
                    linhas_pesquisa[lLen] = descricao;
                }else{
                    for (j = 0; j < lLen; j++) {
                        if(linhas_pesquisa[j] === descricao){
                        }else{
                            linhas_pesquisa[lLen] = descricao;
                        }
                    }
                }
            });
        });
        linhas_pesquisa.sort();
    
        $.each(linhas_pesquisa, function (i, item) {
    $('#select_linhas_pesquisa').append($('<option>', { 
        value: '',
        text : item
    }));
    $('#select_linhas_pesquisa').material_select();
    });
    });
}

function insereCursos(){
    $('#select_cursos').material_select();
    var cursos = [];
    $.getJSON('js/pontos.json', function (pontos) {
        $.each(pontos, function (index, ponto) {
            var curso = String(ponto.Curso);
                lLen = cursos.length;
                if(cursos.length == 0){
                    cursos[lLen] = curso;
                }else{
                    for (j = 0; j < lLen; j++) {
                        if(cursos[j] === curso){
                        }else{
                            cursos[lLen] = curso;
                        }
                    }
                }
        });
        cursos.sort();
    
        $.each(cursos, function (i, item) {
    $('#select_cursos').append($('<option>', { 
        value: '',
        text : item
    }));
    $('#select_cursos').material_select();
    });
    });
}

$(".select_li").click(function(){

    //fecha o ul
    $('#category-list').toggle();
    var uf = String($(this).text());
    if(uf == 'TODOS'){
        Materialize.toast('Listando todos os Programa de Mestrado', 4000);
        carregarPontos(0);
        return;
    }
    var pontos_uf = [];
    $.getJSON('js/pontos.json', function (pontos) {
        $.each(pontos, function (index, ponto) {
            if(uf == ponto.UF){
                $("#span_uf").html("TODOS");
                pontos_uf.push(ponto);
            }
        });

        if(pontos_uf.length > 0){
            $("#span_uf").html(uf);
        Materialize.toast('Foram encontrados '+ pontos_uf.length+' Programa(s) de Mestrado em '+uf, 4000);    
            carregarPontos(pontos_uf);
    }else{
        Materialize.toast('Não foi encontrado nenhum Programa de Mestrado encontrado em '+uf, 4000);
    }
    });
});


$("#select_linhas_pesquisa").change(function(){
    $('#select_linhas_pesquisa').material_select();
    
    var pesquisa = $(this).find(":selected").text();
    
    if(pesquisa == "Todas Linhas de Pesquisa"){
        Materialize.toast('Listando todas as Linhas de Pesquisa', 4000);
        carregarPontos(0);
        return;
    }

   var pontos_linhas = [];
    $.getJSON('js/pontos.json', function (pontos) {
        $.each(pontos, function (index, ponto) {
            $.each(ponto.Linhas_de_Pesquisa, function (i, linha) {
                var descricao = String(linha.descricao);
                lLen = pontos_linhas.length;
                if(pesquisa == descricao){
                    pontos_linhas.push(ponto);
                }
            });
        });
        Materialize.toast('Foram encontrados '+ pontos_linhas.length+' Programa(s) de Mestrado', 4000);    
            carregarPontos(pontos_linhas);
        
    });
});

$("#select_cursos").change(function(){
    $('#select_cursos').material_select();
    
    var pesquisa = $(this).find(":selected").text();
    
    if(pesquisa == "Todos os Cursos"){
        Materialize.toast('Listando todas as Linhas de Pesquisa', 4000);
        carregarPontos(0);
        return;
    }

   var pontos_cursos = [];
    $.getJSON('js/pontos.json', function (pontos) {
        $.each(pontos, function (index, ponto) {
            var curso = String(ponto.Curso);
                lLen = pontos_cursos.length;
                if(pesquisa == curso){
                    pontos_cursos.push(ponto);
                }
        });
        Materialize.toast('Foram encontrados '+ pontos_cursos.length+' Programa(s) de Mestrado', 4000);    
            carregarPontos(pontos_cursos);
    });
});

$(document).ready(function() {
    carregarPontos(0);
    insereLinhasPesquisa();
    insereCursos();
});
