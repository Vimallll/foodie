const fs = require('fs');
let content = fs.readFileSync('frontend/src/App.js', 'utf8');
content = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> origin\/jenish\r?\n/g, '$1');
fs.writeFileSync('frontend/src/App.js', content);
console.log("Resolved App.js");
