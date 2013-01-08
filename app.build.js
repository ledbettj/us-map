({
  appDir: "./src",
  baseUrl: "assets/scripts",
  dir: "./public",
  modules: [{
    name: "election/app"
  }],
  shim: {
    'd3v2': {
      exports: 'd3'
    },
    'underscore': {
      exports: '_'
    }
  }
})
