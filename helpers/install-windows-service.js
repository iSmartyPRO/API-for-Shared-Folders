var Service = require('node-windows').Service
const path = require('path')

var svc = new Service({
  name:'APIforSharedFolders',
  description: 'Web based API for Shared Folders',
  script: path.join(__dirname, '../index.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

svc.on('install',function(){
  svc.start();
});

svc.install();