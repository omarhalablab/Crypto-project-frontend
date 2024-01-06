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
  const [password, setPassword] = useState<string>("");
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
          password:password
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
      const  encryptedMessage = encryptWithAES(message, encryptionKey);

      //// encrypt AES key with public key
      const symmetricKey = encryptionKey;
      console.log("Symmetric Key : ",symmetricKey)
      const publicKey = forge.pki.publicKeyFromPem(
        `${userToMessage.publicKey}`
      );

      const encryptedAesKey = publicKey.encrypt(symmetricKey);


      const apiUrl = "http://localhost:3000/send";
      const requestData = {
        sender: pubKey,
        receiver: userToMessage.publicKey,
        message: encryptedMessage,
        AesKey: encryptedAesKey,
      };

      console.log("Data sent: ",requestData)
      const response = await axios.post(apiUrl, requestData);

      ///check response
      console.log("Response sending message, ", response);
    } catch (error) {}
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
  ): string => {
    const cipher = forge.cipher.createCipher(
      "AES-ECB",  // Change the mode to AES-ECB
      forge.util.createBuffer(forge.util.hexToBytes(key))
    );
    cipher.start();
    cipher.update(forge.util.createBuffer(message, "utf-8"));
    cipher.finish();
    const encryptedMessage = cipher.output.toHex();
    return encryptedMessage;
  };

  return (
    <div>
      {!isConnected ? (
        <Connect
          setUserName={setUserName}
          handleSubmitForm={handleSubmitForm}
          setPassword={setPassword}
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
                    <ReceivedMessages publicKey={pubKey || ""} privateKey={privKey|| ""}/>
                  </Col>
                </Row>
              </div>
            </TabPane>
            <TabPane tabId="3">
              <div style={{ margin: "20px 20px" }}>
                <SentMessages publicKey={pubKey || ""} privateKey={privKey|| ""}/>
              </div>
            </TabPane>
          </TabContent>
        </div>
      )}
    </div>
  );
};

export default App;