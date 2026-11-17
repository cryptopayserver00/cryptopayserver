import { authenticator } from 'otplib';
const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';
const token = authenticator.generate(secret);

console.log("token", token)

const aaa = authenticator.generateSecret(30);
console.log(aaa)