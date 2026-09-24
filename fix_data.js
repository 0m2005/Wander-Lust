const fs = require('fs');
const path = 'd:/MAJORproject/init/data.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/country: "(.*?)",/g, 'country: "$1",\n    owner: "6a9d9a3d6e995b4d39b80f2e",');

fs.writeFileSync(path, content);
