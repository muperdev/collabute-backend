import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllJsFiles(dir) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllJsFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix all relative imports in the dist folder
const jsFiles = getAllJsFiles('./dist');

jsFiles.forEach((file) => {
  const content = readFileSync(file, 'utf8');

  // Replace relative imports without .js extension
  const fixedContent = content.replace(
    /from\s+['"](\.\..+?)['"]/g,
    (match, importPath) => {
      if (importPath.endsWith('.js')) {
        return match; // Already has .js extension
      }
      
      // Check if this is a directory import by looking for specific patterns
      const directoryPatterns = ['/dto', '/decorators', '/strategies', '/processors', '/guards', '/utils', '/config'];
      const isDirectoryImport = directoryPatterns.some(pattern => importPath.endsWith(pattern));
      
      if (isDirectoryImport) {
        return `from '${importPath}/index.js'`;
      }
      
      return `from '${importPath}.js'`;
    }
  ).replace(
    /from\s+['"](\.\/.+?)['"]/g,
    (match, importPath) => {
      if (importPath.endsWith('.js')) {
        return match; // Already has .js extension
      }
      
      // Check if this is a directory import by looking for specific patterns
      const directoryPatterns = ['/dto', '/decorators', '/strategies', '/processors', '/guards', '/utils', '/config'];
      const isDirectoryImport = directoryPatterns.some(pattern => importPath.endsWith(pattern));
      
      if (isDirectoryImport) {
        return `from '${importPath}/index.js'`;
      }
      
      return `from '${importPath}.js'`;
    },
  );

  if (content !== fixedContent) {
    writeFileSync(file, fixedContent);
    console.log(`Fixed imports in ${file}`);
  }
});

console.log('All imports fixed!');