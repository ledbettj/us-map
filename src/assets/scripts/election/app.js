/*jshint undef:true browser:true devel:true*/
/*global require */

require(['d3.v3', 'election/map2', 'election/election-overlay',
         'election/poverty-overlay', 'election/race-overlay', 'queue', 'domReady'],
function(d3, Map, ElectionOverlay, PovertyOverlay, RaceOverlay, queue) {
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

  queue()
    .defer(d3.json, 'data/2012-election.json')
    .defer(d3.json, 'data/2000-race.json')
    .defer(d3.json, 'data/2010-poverty.json')
    .await(function(err, election, race, poverty) {
      dataSetReady('election', new ElectionOverlay(election, {}), true);
      dataSetReady('race', new RaceOverlay(race, {}), false);
      dataSetReady('poverty', new PovertyOverlay(poverty, {}), false);

      App.map = new Map({
        target:    '#map',
        scale:     Math.min(body.clientWidth, body.clientHeight),
        translate: [body.clientWidth / 2, body.clientHeight / 2],
        overlay:   App.overlays.election
      });

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

