import * as fs from 'fs';
import * as path from 'path';

function adjustSvgViewBox(filePath: string): boolean {
    try {
        const content: string = fs.readFileSync(filePath, 'utf8');
        
        const coordsX: number[] = [];
        const coordsY: number[] = [];

        // 1. Path d attributes: Extract all numbers
        const pathRegex: RegExp = / d="([^"]+)"/g;
        let match: RegExpExecArray | null;
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
        const rectRegex: RegExp = / x="([^"]+)"/g;
        while ((match = rectRegex.exec(content)) !== null) {
            const x = parseFloat(match[1]);
            coordsX.push(x);
            const wMatch = content.slice(match.index).match(/ width="([^"]+)"/);
            if (wMatch) coordsX.push(x + parseFloat(wMatch[1]));
        }

        const yRegex: RegExp = / y="([^"]+)"/g;
        while ((match = yRegex.exec(content)) !== null) {
            const y = parseFloat(match[1]);
            coordsY.push(y);
            const hMatch = content.slice(match.index).match(/ height="([^"]+)"/);
            if (hMatch) coordsY.push(y + parseFloat(hMatch[1]));
        }

        const lineRegexX: RegExp = / x[12]="([^"]+)"/g;
        while ((match = lineRegexX.exec(content)) !== null) {
            coordsX.push(parseFloat(match[1]));
        }
        const lineRegexY: RegExp = / y[12]="([^"]+)"/g;
        while ((match = lineRegexY.exec(content)) !== null) {
            coordsY.push(parseFloat(match[1]));
        }

        if (coordsX.length === 0 || coordsY.length === 0) return false;

        const minX: number = Math.min(...coordsX);
        const maxX: number = Math.max(...coordsX);
        const minY: number = Math.min(...coordsY);
        const maxY: number = Math.max(...coordsY);

        let width: number = maxX - minX;
        let height: number = maxY - minY;

        // Min dimensions
        if (width === 0) width = 2;
        if (height === 0) height = 2;

        const padX: number = width * 0.05;
        const padY: number = height * 0.05;

        const newMinX: string = (minX - padX).toFixed(2);
        const newMinY: string = (minY - padY).toFixed(2);
        const newWidth: string = (width + 2 * padX).toFixed(2);
        const newHeight: string = (height + 2 * padY).toFixed(2);

        const newViewBox: string = `viewBox="${newMinX} ${newMinY} ${newWidth} ${newHeight}"`;
        
        const updatedContent: string = content
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

const baseDir: string = "/media/rahat/Working Station1/NexRover/certgen/public";
const folders: string[] = ["ICONS", "Shapes", "Lines", "Ribons", "BAses"];

let totalUpdated: number = 0;
folders.forEach(folder => {
    const folderPath: string = path.join(baseDir, folder);
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
