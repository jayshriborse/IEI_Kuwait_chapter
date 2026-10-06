const fs = require('fs');
const { PDFParse } = require('C:/Users/DELL/.gemini/antigravity-ide/brain/a1ef1478-9573-4611-ac0c-82a3befb0304/scratch/node_modules/pdf-parse');

async function run() {
  const dataBuffer = fs.readFileSync('d:/IEI-Kuwait-Engineering/IEI-Docs/IEI Mobile App 1.pdf');
  const parser = new PDFParse(new Uint8Array(dataBuffer));
  const data = await parser.getText();
  const text = typeof data === 'string' ? data : (data.text || '');
  console.log('Length:', text.length);
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (/guest|browse|apply|application|open to all/i.test(line)) {
      console.log(`L${i}: ${line.trim()}`);
    }
  });
}
run().catch(console.error);
