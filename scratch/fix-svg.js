const fs = require('fs');
const path = require('path');

function adjustSvgViewBox(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        const coordsX = [];
        const coordsY = [];

        // 1. Heuristic for Path d attributes: Extract all numbers
        const pathRegex = / d="([^"]+)"/g;
        let match;
        while ((match = pathRegex.exec(content)) !== null) {
            const nums = match[1].match(/[-+]?\d*\.\d+|\d+/g);
            if (nums) {
                for (let i = 0; i < nums.length; i += 2) {
                    if (nums[i + 1] !== undefined) {
                        coordsX.push(parseFloat(nums[i]));
                        coordsY.push(parseFloat(nums[i + 1]));
                    }
                }
            }
        }

        // 2. Basic shapes (rect, circle, line)
        const rectRegex = / x="([^"]+)"/g;
        while ((match = rectRegex.exec(content)) !== null) {
            const x = parseFloat(match[1]);
            coordsX.push(x);
            const wMatch = content.slice(match.index).match(/ width="([^"]+)"/);
            if (wMatch) coordsX.push(x + parseFloat(wMatch[1]));
        }

        const yRegex = / y="([^"]+)"/g;
        while ((match = yRegex.exec(content)) !== null) {
            const y = parseFloat(match[1]);
            coordsY.push(y);
            const hMatch = content.slice(match.index).match(/ height="([^"]+)"/);
            if (hMatch) coordsY.push(y + parseFloat(hMatch[1]));
        }

        const lineRegexX = / x[12]="([^"]+)"/g;
        while ((match = lineRegexX.exec(content)) !== null) {
            coordsX.push(parseFloat(match[1]));
        }
        const lineRegexY = / y[12]="([^"]+)"/g;
        while ((match = lineRegexY.exec(content)) !== null) {
            coordsY.push(parseFloat(match[1]));
        }

        if (coordsX.length === 0 || coordsY.length === 0) return false;

        const minX = Math.min(...coordsX);
        const maxX = Math.max(...coordsX);
        const minY = Math.min(...coordsY);
        const maxY = Math.max(...coordsY);

        let width = maxX - minX;
        let height = maxY - minY;

        // Ensure minimum dimensions for thin lines
        if (width === 0) { width = 2; }
        if (height === 0) { height = 2; }

        const padX = width * 0.05;
        const padY = height * 0.05;

        const newMinX = (minX - padX).toFixed(2);
        const newMinY = (minY - padY).toFixed(2);
        const newWidth = (width + 2 * padX).toFixed(2);
        const newHeight = (height + 2 * padY).toFixed(2);

        const newViewBox = `viewBox="${newMinX} ${newMinY} ${newWidth} ${newHeight}"`;
        
        const updatedContent = content
            .replace(/viewBox="[^"]+"/, newViewBox)
            .replace(/enable-background:new [^;"]+/, `enable-background:new ${newMinX} ${newMinY} ${newWidth} ${newHeight}`);

        if (updatedContent !== content) {
            fs.writeFileSync(filePath, updatedContent);
            return true;
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
    return false;
}

const baseDir = "/media/rahat/Working Station1/NexRover/certgen/public";
const folders = ["ICONS", "Shapes", "Lines", "Ribons", "BAses"];

let totalUpdated = 0;
folders.forEach(folder => {
    const folderPath = path.join(baseDir, folder);
    if (!fs.existsSync(folderPath)) return;

    fs.readdirSync(folderPath).forEach(file => {
        if (file.endsWith(".svg")) {
            if (adjustSvgViewBox(path.join(folderPath, file))) {
                totalUpdated++;
            }
        }
    });
});

console.log(`Successfully updated ${totalUpdated} SVG files.`);
