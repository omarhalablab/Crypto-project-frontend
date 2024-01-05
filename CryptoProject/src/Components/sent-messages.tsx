import { useState } from "react";
import {
  Table
} from "reactstrap";
interface SentMessagesProps {}

const SentMessages: React.FC<SentMessagesProps> = () => {
  const [messages, setMesages] = useState([]);
  const [error, setError] = useState<boolean>(false);
  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("hello");
  };
  return (
    <div style={{ margin: "20px 20px" }}>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            
            <td>@mdo</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            
            <td>@fat</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default SentMessages;
