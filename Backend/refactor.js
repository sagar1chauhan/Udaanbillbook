const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir);

files.forEach(file => {
  if (file === 'authController.js') return;

  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find controller function definitions like:
  // const getItems = async (req, res) => {
  const funcRegex = /(const\s+\w+\s*=\s*async\s*\(\s*req\s*,\s*res\s*\)\s*=>\s*\{(?:\s*try\s*\{)?)/g;

  content = content.replace(funcRegex, (match) => {
    return `${match}\n    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;\n`;
  });

  // Replace req.user.id with ownerId
  content = content.replace(/req\.user\.id/g, 'ownerId');
  
  // Fix the case where we just defined ownerId using req.user.id
  content = content.replace(/const ownerId = req\.user\.role === 'staff' \? req\.user\.ownerId : ownerId;/g, "const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;");

  fs.writeFileSync(filePath, content);
  console.log(`Refactored ${file}`);
});
