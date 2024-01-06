import { useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
interface SendMessagesProps {
  GenerateAESKey: () => void;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  changeUserToMessage:()=>void;
  encryptionKey:string,
}

const SendMessages: React.FC<SendMessagesProps> = ({
  GenerateAESKey,
  setMessage,
  handleSendMessage,
  changeUserToMessage,
  encryptionKey,
}) => {
  const [error, setError] = useState<boolean>(false);
  const handleSubmit = (e: any) => {
    e.preventDefault();
    handleSendMessage();
  };
  return (
    <div style={{ margin: "20px 20px" }}>
      <div>
        <Button
          color="success"
          onClick={() => {
            GenerateAESKey()
          }}
          style={{marginRight:"20px"}}
        >
          Generate AES Symmetric Key
        </Button>
        <Button color="info" onClick={changeUserToMessage}>Message Another User</Button>
      </div>
      {encryptionKey && <div style={{ margin: "20px 20px" }}>
        <Form>
          <Row>
            <Col md={9}>
              <FormGroup>
                <Label for="phoneNumber">Enter Message</Label>
                <Input
                  id="message"
                  name="message"
                  placeholder="Enter Message"
                  type="text"
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      setError(true);
                    }
                  }}
                  onChange={(e) => {
                    if (e.target.value.trim() === "") {
                      setError(true);
                    } else {
                      setMessage(e.target.value);
                      setError(false);
                    }
                  }}
                  invalid={error}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <div style={{ marginTop: "30px" }}>
                <Button onClick={handleSubmit}>Send Message</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>}
    </div>
  );
};

export default SendMessages;
