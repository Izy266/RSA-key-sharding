const RSA = require("./RSA.js");
const fs = require('fs');
const sss = require('shamirs-secret-sharing');
const tmp = require('tmp-promise');
const path = require('path');

test('Asserts the decrypted text is equal to the original text', async () => {
    //creates temporary directory to run the test which is later deleted
    const dir = await tmp.dir();
    //runs the exported generateKeys function from RSA.js
    await RSA.generateKeys(dir.path, 5);
    const text = "testing"
    //encrypts random plain text using the public key found in 'public.txt'
    const enc = await RSA.encrypt(text, path.join(dir.path, 'public.txt'));
  
    function shardPath(num) {
      return path.join(dir.path, 'Shard[' + num + '].txt');
    }
    //recovers the private key using shards 2 and 5 found in Shard[2].txt and Shard[5].txt 
    recovered = sss.combine([fs.readFileSync(shardPath(2)), fs.readFileSync(shardPath(5))]);
    //decrypts the encrypted text using the recovered key
    const dec = RSA.decrypt(enc, recovered);
    //test if the decrypted plain text is equal to the original plain text
    expect(dec).toBe(text);
})