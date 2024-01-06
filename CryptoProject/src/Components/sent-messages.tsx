import axios from "axios";
import { useEffect, useState } from "react";
import forge from "node-forge";
import { Table, Tooltip } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
interface SentMessagesProps {
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

const SentMessages: React.FC<SentMessagesProps> = ({
  publicKey,
  privateKey,
}) => {
  const [data, setData] = useState<ReceivedMessage[]>([]);
  const [count, setCount] = useState(0);
  const [AESKeysList, setAESKeysList] = useState([]);

  const GetMessages = () => {
    const apiUrl = "http://localhost:3000/outbox";
    const requestData = {
      sender: publicKey,
    };

    axios
      .post(apiUrl, requestData)
      .then((response) => {
        const responseData = response.data;
        console.log("2222222333 ", responseData);
        setData(responseData.messages);
        console.log("responseData.messages ", responseData.messages);
        if (responseData.messages.length > 0) {
          const AESKeys = responseData.messages.map((item: ReceivedMessage) => {
            const privateKeyNew = forge.pki.privateKeyFromPem(privateKey);
            const decryptedAesKey = privateKeyNew.decrypt(item.AesKey);
            return decryptedAesKey;
          });
          setAESKeysList(AESKeys);
          console.log("AESKeys ", AESKeys);
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
      <FontAwesomeIcon
        icon={faArrowsRotate}
        onClick={() => {
          GetMessages();
          setCount(count + 1);
        }}
        style={{
          position: "absolute",
          right: "0px",
          cursor: "pointer",
          top: "-10px",
          fontSize: "30px",
        }}
      />

      <div style={{ margin: "20px 20px" }}>
        <Table>
          <thead>
            <tr>
              <th>Sender Key</th>
              <th>Encrtpted Message</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 &&
              data.map((item: ReceivedMessage) => (
                <tr key={item._id}>
                  <td>{item.sender_key}</td>
                  <td>{item.message}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default SentMessages;
