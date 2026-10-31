const fs = require('fs');
const file = 'C:/Users/Prithviraj Thorat/Desktop/Dairy-management-system/frontend/src/components/customer/CheckoutFlow.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the wrongly placed import
content = content.replace("import toast from 'react-hot-toast';", "");
// Add it at the top
content = "import toast from 'react-hot-toast';\n" + content;

fs.writeFileSync(file, content);
console.log("Fixed toast import!");
