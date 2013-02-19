({
  appDir: "./src",
  baseUrl: "assets/scripts",
  dir: "./public",
  modules: [{
    name: "election/app"
  }],
  shim: {
    'd3.v3': {
      exports: 'd3'
    },
    'd3.geo.projection': {
      deps: ['d3.v3'],
      exports: 'd3'
    },
    'topojson': {
      exports: 'topojson'
    },
    'queue': {
      exports: 'queue'
    },
    'underscore': {
      exports: '_'
    }
  }
})
