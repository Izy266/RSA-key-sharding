const { argv } = require('process');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs/promises');
const sss = require('shamirs-secret-sharing');

const PASSPHRASE = 'tZ*81!Rl';
//takes the first argument after ./RSA.js and uses it as default for num of shards
const arg = Number(process.argv.slice(2)[0]);

//generates public and private key
async function generateKeys(dir, shardNum = arg) {
  [publicKey, privateKey] = await new Promise((resolve, reject) => {
    crypto.generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: PASSPHRASE,
      }
    }, (err, publicKey, privateKey) => {
      if (err) {
        reject(err)
      } else {
        resolve([publicKey, privateKey])
      }
    })
  })
  //writes public key to 'public.txt'
  publicKeyPromise = fs.writeFile(path.join(dir, 'public.txt'), publicKey);
  //shards the private key with the ability to re-create private key if 2 of n shares are presented
  const shares = sss.split(privateKey, { shares: shardNum, threshold: 2 });
  //writes the shards to text files called Shard[k].txt
  shardsPromises = Promise.all(shares.map((shard, i) => fs.writeFile(path.join(dir, 'Shard[' + (i + 1) + '].txt'), shard)));
  await Promise.all([publicKeyPromise, shardsPromises]);
}

//encrypt function, used to encrypt plain text using the public key
async function encrypt(toEncrypt, pathToPublicKey) {
  const publicKey = await fs.readFile(path.resolve(pathToPublicKey), 'utf8');
  return crypto.publicEncrypt(publicKey, Buffer.from(toEncrypt, 'utf8')).toString('base64');
}

//decrypt function, used to decrypt plain text using the corresponding private key
function decrypt(toDecrypt, privateKey) {
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      passphrase: PASSPHRASE,
    },
    Buffer.from(toDecrypt, 'base64'),
  );
  return decrypted.toString('utf8');
}

//exports function modules to be used in RSA.test.js
module.exports = {
  generateKeys,
  encrypt,
  decrypt,
  PASSPHRASE,
};

//if program is run from file to prevent multiple instances when testing
if (require.main == module) {
  generateKeys('.');
}