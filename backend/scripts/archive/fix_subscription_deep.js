const fs = require('fs');
let c = fs.readFileSync('src/controllers/subscriptionController.js', 'utf8');

// Find where the second block starts (the entire duplicate appended section starting from pool)
// This is the duplicate block that was appended during sprint 1 patching
const secondGetMySubs = c.indexOf('const getMySubscriptions', c.indexOf('const getMySubscriptions') + 1);
console.log('Second getMySubscriptions at char:', secondGetMySubs);

if (secondGetMySubs !== -1) {
    // Find what's before it - look backwards for the extra junk
    // The patching added: pool, notifyAdminAndDeliveryBoy declarations and then the entire function set again
    // Let's find the separation point - the end of the requestSkip function
    const beforeDuplicate = c.lastIndexOf('};', secondGetMySubs - 50) + 2;
    console.log('Cutting at char:', beforeDuplicate);
    
    // Keep only up to the end of requestSkip and then the module.exports at the very end
    const moduleExports = c.lastIndexOf('module.exports');
    console.log('module.exports at char:', moduleExports);
    
    const firstHalf = c.substring(0, beforeDuplicate);
    const exportsSection = c.substring(moduleExports);
    
    // Get the last module.exports from the original (first) block
    const firstModuleExports = c.indexOf('module.exports');
    const firstExportsEnd = c.indexOf('\n', c.indexOf('\n', firstModuleExports) + 1) + 1;
    
    const finalCode = firstHalf + '\n\n' + c.substring(firstModuleExports, firstExportsEnd);
    console.log('\nFINAL LINES:', finalCode.split('\n').length);
    fs.writeFileSync('src/controllers/subscriptionController.js', finalCode);
    console.log('DONE - removed duplicate block');
} else {
    console.log('No duplicate found!');
}
