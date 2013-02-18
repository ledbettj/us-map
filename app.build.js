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
    'underscore': {
      exports: '_'
    }
  }
})
