import axios from "axios";
import { useEffect, useState } from "react";
import forge from "node-forge";
import { Table } from "reactstrap";
interface ReceivedMessagesMessagesProps {
    publicKey:string
    privateKey:string
}
interface ReceivedMessage{
    AesKey:string, 
    message:string
    receiver_key: string,
    sender_key: string,
    __v: number,
    _id: string
}

const ReceivedMessages: React.FC<ReceivedMessagesMessagesProps> = ({publicKey,privateKey}) => {
    const [error,setError] = useState<boolean>(false)
    const [data,setData] = useState<ReceivedMessage[]>([])
    const [decrypted_AES_KEY,setDecrypted_AES_KEY] = useState<any>()
    const handleSubmit = (e:any) =>{
        e.preventDefault();
    }

    const GetMessages = () =>{
        const apiUrl = "http://localhost:3000/inbox";
        const requestData = {
            receiver: publicKey,
        };
  
        axios.post(apiUrl,requestData)
        .then((response) => {
          const responseData = response.data;
          console.log("1122 ",responseData)
          setData(responseData.messages)
          if(data.length > 0){
            console.log("inside if statement")
            const AES_KEY = data[0].AesKey;
            console.log("privateKeyNew ", privateKey)
            const privateKeyNew = forge.pki.privateKeyFromPem(privateKey)
            console.log("privateKeyNew ",privateKeyNew , privateKey)
            const decryptedAesKey = privateKeyNew.decrypt(AES_KEY);
            setDecrypted_AES_KEY(decryptedAesKey),
            console.log("decryptedAesKey  ",decryptedAesKey)
        }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
        
      
    }

    useEffect(()=>{
        GetMessages()
    },[])
  return (
    <div style={{ margin: "20px 20px",position:"relative" }}>
      <button onClick={GetMessages} style={{position:"absolute", right:"0px"}}> refresh</button>

      <div style={{ margin: "20px 20px" }}>
      <Table >
        <thead>
          <tr>
            <th>Sender Key</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
        {data.map((item:ReceivedMessage) => (
          <tr key={item.__v}>
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

export default ReceivedMessages;
