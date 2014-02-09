var map;


function addCursorInteraction(layer) {
  var hovers = [];

  layer.bind('featureOver', function(e, latlon, pxPos, data, layer) {
    hovers[layer] = 1;
    if(_.any(hovers)) {
      $('#map').css('cursor', 'pointer');
    }
  });

  layer.bind('featureOut', function(m, layer) {
    hovers[layer] = 0;
    if(!_.any(hovers)) {
      $('#map').css('cursor', 'auto');
    }
  });
}

var layers = [], map;

function main() {

  map = new L.Map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
    center: [40.72488459877373, -73.95],
    zoom: 12
  });


  L.tileLayer('https://{s}.tiles.mapbox.com/v3/cartodb.h0cmgfh8/{z}/{x}/{y}.png', {
    attribution: "<a href='http://mapbox.com/about/maps' target='_blank'>Terms & Feedback</a>"
  }).addTo(map);

  new L.Control.Zoom({ position: 'topright' }).addTo(map);

  cartodb.createLayer(map, 'https://andrew.cartodb.com/api/v2/viz/6ea2c11a-91ab-11e3-85a0-0e49973114de/viz.json')
   .addTo(map)
   .on('done', function(layer) {

    initSearch();
    hc();

    layer.getSubLayer(0).setInteraction(true);
    addCursorInteraction(layer);

    layers.push(layer)

    layer.on('error', function(err) {
      cartodb.log.log('error: ' + err);
    });
  }).on('error', function() {
    cartodb.log.log("some error occurred");
  });
}

function swapLayer(layerUrl, name, agency){
  var old = layers.pop();
  if (old) {
    old.remove();
  }
  $('.agency').html(agency);
  $('#data h1').html(name);

  cartodb.createLayer(map, layerUrl)
   .addTo(map)
   .on('done', function(layer) {

    initSearch();
    hc();

    layer.getSubLayer(0).setInteraction(true);
    addCursorInteraction(layer);

    layers.push(layer)

    layer.on('error', function(err) {
      cartodb.log.log('error: ' + err);
    });
  }).on('error', function() {
    cartodb.log.log("some error occurred");
  });

}
function initSearch(){

    var sql = cartodb.SQL({ user: 'andrew' });
    $( "#dataset" ).autocomplete({
      source: function( request, response ) {
        var s
        sql.execute("select agency, name, api from ootm_data_list where name ilike '" + request.term + "%'").done(function(data) {
           response(data.rows.map(function(r) {
              return {
                label: r.name + " (" + r.agency +")",
                name:  r.name,
                api:   r.api,
                agency:r.agency
              }
            })
          )
        })
      },
      minLength: 2,
      select: function( event, ui ) {
        swapLayer(ui.item.api, ui.item.name, ui.item.agency)
      }
    });
}
function randomSeries(){
  var a = [];
  a.push(Math.floor(Math.random() * 100) / 20)
  for (var i=0; i<11; i++){
    a.push(
      (a[i] + Math.ceil(10*(6 * Math.random())-3))/10
    )
  }
  return a
}
function hc(){

        $('#graph').highcharts({
            chart: {
                backgroundColor: "transparent"
            },
            title: {
                text: null,
                x: -20 //center
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                title: {
                    text: 'Key indicators'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: '°C'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'IndicatorA',
                data: randomSeries()
            }, {
                name: 'IndicatorB',
                data: randomSeries()
            }, {
                name: 'IndicatorC',
                data: randomSeries()
            }, {
                name: 'IndicatorD',
                data: randomSeries()
            }]
        });

}