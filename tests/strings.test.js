import crypto from 'crypto';

const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const length = 12
let result = '';
const values = new Uint8Array(length);

crypto.getRandomValues(values);

values.forEach((value) => {
  result += charset[value % charset.length];
});

console.log(result);
