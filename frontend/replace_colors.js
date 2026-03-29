import fs from 'fs';
import path from 'path';

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
};

const files = walk('d:/GDG_codenation_app/CodeNation/frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace tailwind green classes
    content = content.replace(/text-\[\#00FF94\]/g, 'text-white');
    content = content.replace(/bg-\[\#00FF94\]/g, 'bg-white');
    content = content.replace(/border-\[\#00FF94\]/g, 'border-white');
    content = content.replace(/from-\[\#00FF94\]/g, 'from-white');
    content = content.replace(/to-\[\#00FF94\]/g, 'to-zinc-300');
    content = content.replace(/text-green-300/g, 'text-zinc-300');
    content = content.replace(/text-green-400/g, 'text-zinc-400');
    content = content.replace(/text-green-500/g, 'text-white');
    content = content.replace(/bg-green-600/g, 'bg-white');
    content = content.replace(/hover:bg-green-500/g, 'hover:bg-zinc-200');
    content = content.replace(/bg-green-900\/50/g, 'bg-white/10');
    content = content.replace(/border-green-500\/30/g, 'border-white/30');

    // Replace hex codes (case insensitive)
    content = content.replace(/#00ff94/gi, '#ffffff');
    content = content.replace(/rgba\(0,255,148,/gi, 'rgba(255,255,255,');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
