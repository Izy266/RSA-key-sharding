# RSA-key-sharding
The RSA.js program generates a RSA public and private key, writes the public key to 'public.txt' and shards the private key into k of n shares, taking k as an argument on the CLI, writing each shard to its respective Shard[k].txt file

Run the program using the command `node ./RSA.js k` where k is the number of shards.

To run the unit test, use `npm run test`, which runs the RSA.test.js file using Jest. 

The RSA.test.js test file uses the generateKeys function in RSA.js to create an RSA key pair with the private key being broken into 5 shards. The public key along with the private key shards are all written into *.txt files located in a temporary directory that is later deleted. It then encrypts a random plain text, in this case 'testing', using the RSA public key. It goes on to reassemble the private key using shards 2 and 5 from the Shard[2].txt and Shard[5].txt files and uses that reassembled key to decrypt the encrypted 'testing' text back to plain text.
