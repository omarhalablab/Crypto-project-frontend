import React, { useEffect, useState } from 'react';
import forge from 'node-forge';

interface EncryptorProps {}

const App: React.FC<EncryptorProps> = () => {
  const [plaintext, setPlaintext] = useState<string>('');
  const [encryptedMessage, setEncryptedMessage] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>(''); // Added state for encryption key

  // Function to generate a random symmetric key
  const generateSymmetricKey = (): string => {
    return forge.random.getBytesSync(32); // 256 bits for AES-256
  };


  useEffect(()=>{
    const symmetricKey = generateSymmetricKey();
    console.log("KEY , ",symmetricKey)
    const hexString = Array.from(symmetricKey, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
    console.log("Key As String ", hexString);

    setEncryptionKey(hexString); // Set the encryption key to state
  },[])

  ///generate rsa keys (private and public)
  useEffect(() => {
    // Function to generate RSA key pair
    const generateRSAKeys = () => {
      // Generate a new key pair
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
        console.log("keypair",keyPair)
      // Convert keys to PEM format
      const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
      const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

      // Log the keys (you can handle them as needed)
      console.log('Private Key:', privateKeyPem);
      console.log('Public Key:', publicKeyPem);
    };

    // Call the function to generate keys
    generateRSAKeys();
  }, []);

  ///exchange the public keys with the server
  ///




  // Function to encrypt a message using AES (symmetric key)
  const encryptWithAES = (message: string, key: string): { iv: string; encryptedMessage: string } => {
    const iv = forge.random.getBytesSync(16);
    const cipher = forge.cipher.createCipher('AES-CBC', forge.util.createBuffer(forge.util.hexToBytes(key)));
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(message, 'utf-8'));
    cipher.finish();
    const encryptedMessage = cipher.output.toHex();
    return { iv: forge.util.bytesToHex(iv), encryptedMessage };
  };

  const handleEncryption = () => {
   if(encryptionKey != ""){
    // Encrypt the user's plaintext
    const { encryptedMessage, iv } = encryptWithAES(plaintext, encryptionKey);

    console.log(`Original Message: ${plaintext}`);
    console.log(`Symmetric Key Used: ${encryptionKey}\n`);

    setEncryptedMessage(encryptedMessage);
   }
    
    
  };

  const handleDecryption = () => {
    // Decrypt the message using the user-provided key
    const decryptedMessage = decryptWithAES(encryptedMessage || '', encryptionKey, ''); // IV is not used here

    console.log(`Decrypted Message: ${decryptedMessage}`);
  };

  // Function to decrypt a message using AES (symmetric key)
  const decryptWithAES = (encryptedMessage: string, key: string, iv: string): string | null => {
    try {
      const decipher = forge.cipher.createDecipher('AES-CBC', forge.util.createBuffer(forge.util.hexToBytes(key)));
      decipher.start({ iv: forge.util.createBuffer(forge.util.hexToBytes(iv)) });
      decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encryptedMessage)));
      decipher.finish();
      return decipher.output.toString('utf-8');
    } catch (error: any) {
      console.error('Error during decryption:', error.message);
      return null;
    }
  };

  return (
    <div style={{ margin: "50px 0px 0px 100px" }}>
      <label>Enter the text to encrypt: </label>
      <input
        type="text"
        value={plaintext}
        onChange={(e) => setPlaintext(e.target.value)}
      />
      <button onClick={handleEncryption}>Encrypt</button>

      <div>
        <h3>Encrypted Message:</h3>
        <p>{encryptedMessage}</p>
      </div>

      <label>Key used for encryption: {encryptionKey}</label>

      <div>
        <label>Enter the key to decrypt: </label>
        <input
          type="text"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
        />
        <button onClick={handleDecryption}>Decrypt</button>
      </div>
    </div>
  );
};

export default App;
