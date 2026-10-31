const fs = require('fs');

let c = fs.readFileSync('src/controllers/deliveryController.js', 'utf8');

c = c.replace(
  'c.id as customer_id, u.name as customer, c.address,',
  'c.id as customer_id, u.name as customer, c.address, c.gps_lat, c.gps_lng,'
);

fs.writeFileSync('src/controllers/deliveryController.js', c);
console.log('patched deliveryController');
