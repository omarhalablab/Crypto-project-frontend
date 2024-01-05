import forge from "node-forge";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import Connect from "./connect";
import CheckMessages from "./check-messages";
import SentMessages from "./sent-messages";
import SendMessages from "./send-messages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons"; // Replace 'faIconName' with the specific icon you want
interface userData {
  number: string | number;
  publicKey: string;
}
interface EncryptorProps {}

const App: React.FC<EncryptorProps> = () => {
  const [plaintext, setPlaintext] = useState<string>("");
  const [encryptedMessage, setEncryptedMessage] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [isConnected, setIsConnected] = useState<Boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<any>(1);
  const [validNumber, setValidNumber] = useState<string>("null");
  const [userToMessage, setUserToMessage] = useState<userData>({
    number: "",
    publicKey: "",
  });
  const [UserDoesNotExist, setUserDoesNotExist] = useState<boolean>(false);
  // public and private keys for RSA
  const [pubKey, setPublicKey] = useState<string>();
  const [privKey, setPrivateKey] = useState<string>();

  const generateSymmetricKey = (): string => {
    return forge.random.getBytesSync(32); // 256 bits for AES-256
  };

  const handleSubmitForm = async () => {
    if (userName.trim() === "") {
      console.log("denied");
    } else {
      try {
        const apiUrl = "http://localhost:3000/connect";
        const requestData = {
          phone: userName,
          public_key: pubKey,
        };

        const response = await axios.post(apiUrl, requestData);

        ///check response
        console.log("Response connecting , ", response);

        response.status === 201 && setIsConnected(true);
      } catch (error) {
        // Handle any errors that occur during the request
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

      ///check response
      console.log("Response checking user, ", response);

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

  const GenerateAESKey = () => {
    const symmetricKey = generateSymmetricKey();
    const hexString = Array.from(symmetricKey, (byte) =>
      ("0" + (byte & 0xff).toString(16)).slice(-2)
    ).join("");
    setEncryptionKey(hexString);
    console.log("AES key :", hexString);
  };

  useEffect(() => {
    // const generateRSAKeys = () => {
    //   const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    //   console.log("keypair", keyPair);
    //   const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
    //   const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
    //   console.log("Private Key:", privateKeyPem);
    //   console.log("Public Key:", publicKeyPem);
    //   setPrivateKey(privateKeyPem)
    //   setPublicKey(publicKeyPem)
    // };

    const generateRSAKeys = () => {
      const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });

      // Extract raw keys without PEM formatting
      const privateKey = forge.pki.privateKeyToAsn1(keyPair.privateKey);
      const publicKey = forge.pki.publicKeyToAsn1(keyPair.publicKey);

      // Convert ASN.1 objects to DER encoding (binary)
      const privateKeyDer = forge.asn1.toDer(privateKey).getBytes();
      const publicKeyDer = forge.asn1.toDer(publicKey).getBytes();

      // Convert DER encoding to base64 for easy storage or transmission
      const privateKeyBase64 = forge.util.encode64(privateKeyDer);
      const publicKeyBase64 = forge.util.encode64(publicKeyDer);

      console.log("Private Key (Raw):", privateKeyBase64);
      console.log("Public Key (Raw):", publicKeyBase64);

      // Store or use the keys as needed
      setPrivateKey(privateKeyBase64);
      setPublicKey(publicKeyBase64);
    };

    generateRSAKeys();
  }, []);

  const encryptWithAES = (
    message: string,
    key: string
  ): { iv: string; encryptedMessage: string } => {
    const iv = forge.random.getBytesSync(16);
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

  const handleEncryption = () => {
    if (encryptionKey !== "") {
      const { encryptedMessage, iv } = encryptWithAES(plaintext, encryptionKey);
      console.log(`Original Message: ${plaintext}`);
      console.log(`Symmetric Key Used: ${encryptionKey}\n`);
      setEncryptedMessage(encryptedMessage);
    }
  };

  const handleDecryption = () => {
    const decryptedMessage = decryptWithAES(
      encryptedMessage || "",
      encryptionKey,
      ""
    );
    console.log(`Decrypted Message: ${decryptedMessage}`);
  };

  const decryptWithAES = (
    encryptedMessage: string,
    key: string,
    iv: string
  ): string | null => {
    try {
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
                Recieve Messages
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 3 ? "active" : ""}
                onClick={() => {
                  setActiveTab(3);
                }}
              >
                Sent Messages
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
                    <SendMessages GenerateAESKey={GenerateAESKey} />
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tabId="2">
              <div style={{ margin: "20px 20px" }}>
                <Row>
                  <Col sm="12">
                    <h4>Tab 2 Contents</h4>
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
