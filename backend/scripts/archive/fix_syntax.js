const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, 'frontend/src'), function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix syntax error introduced by the subagent: 
        // await api.post('...', {})
        // });
        const regex = /(await api\.[a-z]+\([^)]+\))(?:\s*\n\s*\}\);)/g;
        if (regex.test(content)) {
            console.log("Fixing in", filePath);
            content = content.replace(regex, "$1;");
            fs.writeFileSync(filePath, content);
        }
    }
});
