import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import forge from "node-forge";
import { useEffect, useState } from "react";
import { Table } from "reactstrap";
interface ReceivedMessagesMessagesProps {
  publicKey: string;
  privateKey: string;
}
interface ReceivedMessage {
  AesKey: string;
  message: string;
  receiver_key: string;
  sender_key: string;
  __v: number;
  _id: string;
}

const ReceivedMessages: React.FC<ReceivedMessagesMessagesProps> = ({
  publicKey,
  privateKey,
}) => {
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<ReceivedMessage[]>([]);
  const [decrypted_AES_KEY, setDecrypted_AES_KEY] = useState<any>();
  const [count,setCount]= useState(0)
  const [AESKeysList,setAESKeysList]= useState([])
  const decryptWithAES = (
    encryptedMessage: string,
    key: string
  ): string | null => {
    try {
      console.log("Decryption Process :", encryptedMessage, key);
      const decipher = forge.cipher.createDecipher(
        "AES-ECB", // Change the mode to AES-ECB
        forge.util.createBuffer(forge.util.hexToBytes(key))
      );
      decipher.start();
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

  const GetMessages = () => {
    const apiUrl = "http://localhost:3000/inbox";
    const requestData = {
      receiver: publicKey,
    };

    axios
      .post(apiUrl, requestData)
      .then((response) => {
        const responseData = response.data;
        console.log("1122 ", responseData);
        setData(responseData.messages);
        console.log("responseData.messages ",responseData.messages)
        if (responseData.messages.length >0) {
            const AESKeys = responseData.messages.map((item:ReceivedMessage)=>{
                const privateKeyNew = forge.pki.privateKeyFromPem(privateKey);
          const decryptedAesKey = privateKeyNew.decrypt(item.AesKey);
                return decryptedAesKey
            })
            setAESKeysList(AESKeys)
            console.log("AESKeys ",AESKeys)
          const AES_KEY = responseData.messages[0].AesKey;
          const privateKeyNew = forge.pki.privateKeyFromPem(privateKey);
          const decryptedAesKey = privateKeyNew.decrypt(AES_KEY);
          setDecrypted_AES_KEY(decryptedAesKey);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    GetMessages();
  }, []);
  return (
    <div style={{ margin: "20px 20px", position: "relative" }}>

<FontAwesomeIcon icon={faArrowsRotate}  onClick={()=>{
            GetMessages()
            setCount(count+1)
        }
           
        }
        style={{ position: "absolute", right: "0px",cursor:"pointer",top:"-10px",fontSize:"30px"  }}/>

      <div style={{ margin: "20px 20px" }}>
        <Table>
          <thead>
            <tr>
              <th>Sender Key</th>
              <th>Encrtpted Message</th>
              <th>Decrypted Message</th>
            </tr>
          </thead>
          <tbody>
            {data.length>0  && data.map((item: ReceivedMessage,index) => (
              <tr key={item._id}>
                <td>{item.sender_key}</td>
                <td>
                  {item.message}
                </td>
                <td>{decryptWithAES(item.message, AESKeysList[index])}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ReceivedMessages;
