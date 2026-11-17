// import crypto from 'crypto';

// const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// const length = 12;
// let result = '';
// const values = new Uint8Array(length);

// crypto.getRandomValues(values);

// values.forEach((value) => {
//   result += charset[value % charset.length];
// });

// console.log(result);

const text = "polygon:0xef17173f36dfd945bab44e60688f33efd2890706?token=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&amount=12"
const regex = /^(polygon|arbitrumsepolia):([^?]+)(\?token=([^&]+)&amount=(\d+)|\?amount=(\d+))$/

const matchText = text.match(regex);
console.log(matchText)
