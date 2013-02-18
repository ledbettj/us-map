/*jshint undef:true browser:true devel:true*/
/*global require */

require(['d3.v3', 'election/map2', 'election/election-overlay',
         'election/poverty-overlay', 'election/race-overlay', 'domReady'],
function(d3, Map, ElectionOverlay, PovertyOverlay, RaceOverlay) {
  var body = d3.select('body').node();

  var App = {
    overlays: [],
    map: null
  };

  function dataSetReady(name, set, isDefault) {
    App.overlays[name] = set;

    var opt = d3.select('select')
      .append('option')
      .attr('value', name)
      .text(set.name);

    if (isDefault) {
      opt.attr('selected', 'selected');
    }
  }

  d3.json('data/2012-election.json', function(json) {
    dataSetReady('election',new ElectionOverlay(json, {}), true);

    App.map = new Map({
      target:    '#map',
      scale:     Math.min(body.clientWidth, body.clientHeight),
      translate: [body.clientWidth / 2, body.clientHeight / 2],
      overlay:   App.overlays.election
    });

  });

  d3.json('data/2000-race.json', function(json) {
    dataSetReady('race', new RaceOverlay(json, {}));
  });

  d3.json('data/2010-poverty.json', function(json) {
    dataSetReady('poverty', new PovertyOverlay(json, {}));

  });

  d3.select('select')
    .on('change', function(d) {
      var opts = d3.select(this).selectAll('option')[0];
      for(var i = 0; i < opts.length; ++i) {
        if (opts[i].selected) {
          App.map.overlay = App.overlays[opts[i].value];
          break;
        }
      }
    });

  window.App = App;
});

