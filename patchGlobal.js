const fs = require('fs');
const path = require('path');

// Directory path to fixed-data-table module
const dirPath = path.resolve(__dirname, 'node_modules/fixed-data-table/internal');

// Recursively walk through the directory and patch all JS files
function walkDirectory(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${dir}`);
            return;
        }

        files.forEach(file => {
            const fullPath = path.join(dir, file);

            fs.stat(fullPath, (err, stats) => {
                if (err) {
                    console.error(`Error checking stats for file: ${fullPath}`);
                    return;
                }

                if (stats.isDirectory()) {
                    walkDirectory(fullPath); 
                } else if (stats.isFile() && fullPath.endsWith('.js')) {
                    patchFile(fullPath);
                }
            });
        });
    });
}

// Function to patch the file content
function patchFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${filePath}`);
            return;
        }

        // Replace global references with window
        const result = data.replace(/\bglobal\b/g, 'window');

        // Only overwrite if there is a change
        if (result !== data) {
            fs.writeFile(filePath, result, 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing file: ${filePath}`);
                } else {
                    console.log(`Patched 'global' to 'window' in ${filePath}`);
                }
            });
        }
    });
}

walkDirectory(dirPath);
