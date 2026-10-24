import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = path.resolve('flutter_earthlink_app');
const outputZip = path.resolve('public/flutter_earthlink_app.zip');

const zip = new JSZip();

function addDirectoryToZip(dirPath, zipFolder) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const subFolder = zipFolder.folder(item);
      addDirectoryToZip(fullPath, subFolder);
    } else {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(item, content);
    }
  }
}

addDirectoryToZip(rootDir, zip);

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }).then((buffer) => {
  fs.writeFileSync(outputZip, buffer);
  console.log('Successfully created Flutter ZIP at:', outputZip, 'Size:', buffer.length, 'bytes');
}).catch((err) => {
  console.error('Error creating ZIP:', err);
});
