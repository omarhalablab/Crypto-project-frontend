import { faCheck } from "@fortawesome/free-solid-svg-icons"; // Replace 'faIconName' with the specific icon you want
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import forge from "node-forge";
import React, { useEffect, useState } from "react";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import CheckMessages from "./check-messages";
import Connect from "./connect";
import SendMessages from "./send-messages";
import SentMessages from "./sent-messages";
import ReceivedMessages from "./recieved-messages";
interface userData {
  number: string | number;
  publicKey: string;
}
interface EncryptorProps {}

const App: React.FC<EncryptorProps> = () => {
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [isConnected, setIsConnected] = useState<Boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<any>(1);
  const [userToMessage, setUserToMessage] = useState<userData>({
    number: "",
    publicKey: "",
  });
  const [UserDoesNotExist, setUserDoesNotExist] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  // public and private keys for RSA
  const [pubKey, setPublicKey] = useState();
  const [privKey, setPrivateKey] = useState();
  const [keyPair, setKeyPair] = useState<any>();
  const generateSymmetricKey = (): string => {
    return forge.random.getBytesSync(32); // 256 bits for AES-256
  };

  const handleSubmitForm = async () => {
    if (userName.trim() === "") {
    } else {
      try {
        const apiUrl = "http://localhost:3000/connect";
        const requestData = {
          phone: userName,
          public_key: pubKey,
        };

        const response = await axios.post(apiUrl, requestData);

        response.status === 201 && setIsConnected(true);
      } catch (error) {
        console.error("Error connecting to server:", error);
      }
    }
  };

  const handleCheckNumber = async (PhoneNumber: string | number) => {
    try {
      const apiUrl = "http://localhost:3000/check";
      const requestData = {
        phone: PhoneNumber,
      };

      const response = await axios.post(apiUrl, requestData);

      if (response.status === 201 || response.status === 200) {
        setUserToMessage({
          number: PhoneNumber,
          publicKey: response.data.public_key,
        });
      }
    } catch (error) {
      setUserDoesNotExist(true);

      setTimeout(() => {
        setUserDoesNotExist(false);
      }, 2000);
      console.error("Error checking number:", error);
    }
  };

  const handleSendMessage = async () => {
    try {
      //encrypt message using AES key
      const { encryptedMessage, iv } = encryptWithAES(message, encryptionKey);

      //// encrypt AES key with public key
      const symmetricKey = encryptionKey;
      console.log("Symmetric Key : ",symmetricKey)
      const publicKey = forge.pki.publicKeyFromPem(
        `${userToMessage.publicKey}`
      );

      const encryptedAesKey = publicKey.encrypt(symmetricKey);

      const AESkeyHEX = forge.util.bytesToHex(encryptedAesKey);

      const apiUrl = "http://localhost:3000/send";
      const requestData = {
        sender: pubKey,
        receiver: userToMessage.publicKey,
        message: encryptedMessage,
        AesKey: AESkeyHEX,
      };

      console.log("Data sent: ",requestData)
      const response = await axios.post(apiUrl, requestData);

      ///check response
      console.log("Response sending message, ", response);
    } catch (error) {}
  };

  const decryptSymmetricKey = (
    encryptedSymmetricKeyHex: string,
    privateKeyPem: string
  ) => {
    console.log("aqqqa ", encryptedSymmetricKeyHex, privateKeyPem);
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Convert the encrypted symmetric key from hex to bytes
    const encryptedSymmetricKeyBytes = forge.util.hexToBytes(
      encryptedSymmetricKeyHex
    );
    console.log("encryptedSymmetricKeyBytes ,", encryptedSymmetricKeyBytes);
    console.log("test ");
    // Decrypt the symmetric key using RSA
    const decryptedSymmetricKey = privateKey.decrypt(
      encryptedSymmetricKeyBytes
    );
    console.log("test 1");
    console.log("decryptedSymmetricKey ,", decryptedSymmetricKey);
    return decryptedSymmetricKey;
  };

  const GenerateAESKey = () => {
    const symmetricKey = generateSymmetricKey();
    const symmetricKEyHex = forge.util.bytesToHex(symmetricKey);

    setEncryptionKey(symmetricKEyHex);
  };

  useEffect(() => {
    const generateRSAKeys = () => {
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
      const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
      console.log("Private Key:", privateKeyPem);
      console.log("Public Key:", publicKeyPem);
      setPrivateKey(privateKeyPem);
      setPublicKey(publicKeyPem);
      setKeyPair(keyPair);
    };

    generateRSAKeys();
  }, []);

  const encryptWithAES = (
    message: string,
    key: string
  ): { iv: string; encryptedMessage: string } => {
    const iv = forge.random.getBytesSync(32);
    const cipher = forge.cipher.createCipher(
      "AES-CBC",
      forge.util.createBuffer(forge.util.hexToBytes(key))
    );
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(message, "utf-8"));
    cipher.finish();
    const encryptedMessage = cipher.output.toHex();
    return { iv: forge.util.bytesToHex(iv), encryptedMessage };
  };

  const decryptWithAES = (
    encryptedMessage: string,
    key: string,
    iv: string
  ): string | null => {
    try {
      console.log("Decryption Process :", encryptedMessage, key, iv);
      const decipher = forge.cipher.createDecipher(
        "AES-CBC",
        forge.util.createBuffer(forge.util.hexToBytes(key))
      );
      decipher.start({
        iv: forge.util.createBuffer(forge.util.hexToBytes(iv)),
      });
      decipher.update(
        forge.util.createBuffer(forge.util.hexToBytes(encryptedMessage))
      );
      decipher.finish();
      return decipher.output.toString("utf-8");
    } catch (error: any) {
      console.error("Error during decryption:", error.message);
      return null;
    }
  };

  console.log("keyPair.privateKey 1", keyPair.privateKey)

  return (
    <div>
      {!isConnected ? (
        <Connect
          setUserName={setUserName}
          handleSubmitForm={handleSubmitForm}
        />
      ) : (
        <div>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === 1 ? "active" : ""}
                onClick={() => {
                  setActiveTab(1);
                }}
              >
                Send Message
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 2 ? "active" : ""}
                onClick={() => {
                  setActiveTab(2);
                }}
              >
                Inbox
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 3 ? "active" : ""}
                onClick={() => {
                  setActiveTab(3);
                }}
              >
                Outbox
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab.toString()}>
            <TabPane tabId="1">
              <div style={{ margin: "20px 20px" }}>
                {encryptionKey != "" && (
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, right: 0 }}>
                      <FontAwesomeIcon icon={faCheck} />
                      <h6>Key Generated</h6>
                    </div>
                  </div>
                )}
                {userToMessage.number == "" ? (
                  <Row>
                    <Col sm="12">
                      <CheckMessages handleCheckNumber={handleCheckNumber} />
                    </Col>
                    {UserDoesNotExist && (
                      <h3 style={{ color: "red" }}> User Does not Exist</h3>
                    )}
                  </Row>
                ) : (
                  <div>
                    <SendMessages
                      GenerateAESKey={GenerateAESKey}
                      setMessage={setMessage}
                      handleSendMessage={handleSendMessage}
                    />
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tabId="2">
              <div style={{ margin: "20px 20px" }}>
                <Row>
                  <Col sm="12">
                    <ReceivedMessages publicKey={pubKey || ""} privateKey={keyPair.privateKey|| ""}/>
                  </Col>
                </Row>
              </div>
            </TabPane>
            <TabPane tabId="3">
              <div style={{ margin: "20px 20px" }}>
                <SentMessages />
              </div>
            </TabPane>
          </TabContent>
        </div>
      )}
    </div>
  );
};

export default App;

{
  /* <div style={{ margin: "50px 0px 0px 100px" }}>
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
</div>}

</div>
 */
}

// const handleEncryption = () => {
//   if (encryptionKey !== "") {
//     const { encryptedMessage, iv } = encryptWithAES(plaintext, encryptionKey);
//     console.log(`Original Message: ${plaintext}`);
//     console.log(`Symmetric Key Used: ${encryptionKey}\n`);
//     setEncryptedMessage(encryptedMessage);
//   }
// };

// const handleDecryption = () => {
//   const decryptedMessage = decryptWithAES(
//     encryptedMessage || "",
//     encryptionKey,
//     ""
//   );
//   console.log(`Decrypted Message: ${decryptedMessage}`);
// };

// const test = () => {
//   const pub = pubKey;
//   const priv = privKey;
//   const aesKey = encryptionKey;

//   console.log(forge.util.bytesToHex(aesKey));

//   // Encrypt AES key with RSA public key
//   const encryptedAesKey = keyPair.publicKey.encrypt(aesKey);

//   console.log("\nEncrypted AES Key:");
//   console.log(forge.util.bytesToHex(encryptedAesKey));

//   // Decrypt AES key with RSA private key
//   const decryptedAesKey = keyPair.privateKey.decrypt(encryptedAesKey);

//   console.log("\nDecrypted AES Key:");
//   console.log(forge.util.bytesToHex(decryptedAesKey));
// };

//   const privateKey = forge.pki.privateKeyFromPem(`-----BEGIN RSA PRIVATE KEY-----
// MIIEogIBAAKCAQEAitkyBAx4J2AIfhNtlam0K5iImKRcVgCfBcOSB2R/a9qO3t4z
// UpgcM0R7spy5EWhqhDTc3Nm2XfmlKwEaTibIArCMGCHgrjSfifnFb9Vk8hf5FaBx
// SzFahpeEFUij1bgvcUdJ2T4xtt3yfNOdTl1rbdjZXsmzbD5qPSxZAU9YW/mlIBnQ
// AUVWQeYe+Hu1fHuP9A8s/LCq/g0I8VMtTWuqGqPejBswHJAz+NwljAc5fgwxHkD5
// XgSJRUBfprYerYbqCJrhJ/NKR46HE6TwzFAYGAlV/mUK6mb5auS94pqwBQUNlAMg
// NKFLWTszatQ548MzVHqh1rM8Ue7ZAbn/d3F2PwIDAQABAoIBADz552Ipy7aXEQO1
// KoH4dhxTL2HBhJ9sRGn2mjHO67qE0AuGD4ntLS1CnQQymX/QmD6ZLIl8vv8EPInn
// QRMjKuErgUqzzgUTLSEd5JwZXeyHpKbfwAFimjvTXHkwXmrkKUmZIhBapOCHFg/F
// qyaYFi62dbeP4tDdlDBrQmc13jr9fK7IaHZWOGDk+DHH/KCgF1noLqw3OhmF14Ze
// HeDniRR1PeUyXLNn8i8jDmf1xg6WOU7ujFYTEsd0aKvyu41VFblh1dmmN8qWvJ0B
// GF4Jt/Zcpu4Vr/CvGcCM5Ra2UxXwrlsQmDBdDyDOSSregXIcpeooGB+YYhgyHDxB
// PH12fLECgYEA7HqtUT07Lah+UF1lL6exx61p9+MGpu3WdO4Nhjm3id+ubRsl2rMZ
// vIW63qD9GM/5dGE2sVr+8QCdhYHclT1xJny40LSJA0n9Np8+wVUdrAhGTya6knu7
// MUZSRlCVFVcS3Dhak1Q+0YByqu8hse3xO+naeCRrp9vgN4uvfZnUoGcCgYEAlk9d
// wR94wi8Z5aeDKOJq4B9w/7ppO4iD6uvtMS1BK5I47KyYa3/s13fHoX5IIgLPoJOF
// TWM5UbFB2oqBHBE8C9/afiVD5HuXvk6nBBf1xM3IsKnaN58uwxpGcBowJAerZ9vF
// IHxBEmAT6pvYj/E2PKDbXSfEFSU1/HXJrPjrdGkCgYB4/pvHQUkSJ2/Ztq+bHnY7
// 8GKTzrkMmAxub47D6qwaAzS/5nAL4i984f+nAT/+fgronQTa4fAnZ2Uxdixiv7kx
// NAdr4bNo12aTmA8H5ID2EJXI0cwMPvqcT5qxF3HwJUklHEBbuXMaxlnlU80tuM0B
// FroNVrUugbXLNdFotliwaQKBgAUhbmTSKzANpYemQR7bI6TEzfmcpkzm6wHQzcbY
// 8ZmIIzNI7Ob2deIg74p+of2vNOEZR/qNQX6dW08XXTLVD8Sj/nRB12BsK5DOZHsK
// SlROZeRJ1+4AG/uC4RagfjYsoNgpsz/Zner/po5ihXDcXeqR3wr9+X5zR7V3W8vw
// rzDJAoGAIVbzQW+29Cw5r8GaT3mrwnjaCRSP0UVy815a5BfEudP78tD9Cvo6Poz4
// tIfNFPkk/AAwQfINF3Gi9R0OdIpSShOn3pZam7RL/f1IUatqJ1oI6HNJR8Pe8WF4
// 9bLnW04d0gDd1DWb6nEiUNNZi+DKFzK2H8vVT0j8bFPCFK3Tsw0=
// -----END RSA PRIVATE KEY-----`)

////

// console.log(
//   "message: ",
//   message,
//   "\nencryptedMessage ",
//   encryptedMessage,
//   "\n symmetric key : ",
//   encryptionKey,
//   "\nencrypted symmetric key",
//   encryptedSymmetricKeyHex
// );
// const decryptedMessage = decryptWithAES(
//   encryptedMessage,
//   encryptionKey,
//   iv
// );
// console.log("decryptedMessage ", decryptedMessage);
// if (privKey) {
//   const x = decryptSymmetricKey(encryptedSymmetricKeyHex, privKey);
//   console.log(" oasdhoaisdsa ", x);
// }
