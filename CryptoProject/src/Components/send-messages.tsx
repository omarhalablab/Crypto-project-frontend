import { useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
interface SendMessagesProps {
    GenerateAESKey:()=>void
    setMessage:React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage:()=>void
}

const SendMessages: React.FC<SendMessagesProps> = ({GenerateAESKey,setMessage,handleSendMessage}) => {
    const [error,setError] = useState<boolean>(false)
    const [phoneNumberToCheck , setPhoneNumberToCheck] = useState<string|number>()
    const handleSubmit = (e:any) =>{
        e.preventDefault();
        handleSendMessage()
    }
  return (
    <div style={{ margin: "20px 20px" }}>
        <div>
  <Button
    color="success"
    onClick={() =>{ GenerateAESKey()}}
  >
    Generate AES Symmetric Key
  </Button>
</div>
    <div style={{margin:"20px 20px"}}>
      <Form>
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="phoneNumber">Enter Message</Label>
              <Input
                id="message"
                name="message"
                placeholder="Enter Message"
                type="text"
                onBlur={(e)=>{
                    if(e.target.value === ""){
                        setError(true)
                    }
                }}
                onChange={(e)=>{
                    if(e.target.value.trim() === ""){
                        setError(true)
                    }
                    else{
                      setMessage(e.target.value)
                        setError(false)
                    }
                }}
                invalid={error}
              />
            </FormGroup>
          </Col>
          <Col md={6} >
            <div style={{marginTop:"30px"}}>
            <Button onClick={handleSubmit}>Check</Button>
            </div>
          </Col>
        </Row>
      </Form>
      </div>
    </div>
  );
};

export default SendMessages;
