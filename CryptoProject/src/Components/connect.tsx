import { useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
interface ConnectProps {
    setUserName:React.Dispatch<React.SetStateAction<string>>;
    handleSubmitForm:()=>void
}

const Connect: React.FC<ConnectProps> = ({setUserName,handleSubmitForm}) => {
    const [error,setError] = useState<boolean>(false)
    const handleSubmit = (e:any) =>{
        e.preventDefault();
        console.log("hello")
        handleSubmitForm()
    }
  return (
    <div style={{ margin: "20px 20px" }}>
      <Form>
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter Phone Number"
                type="number"
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
                        setUserName(e.target.value)
                        setError(false)
                    }
                }}
                invalid={error}
              />
            </FormGroup>
          </Col>
          <Col md={6} >
            <div style={{marginTop:"30px"}}>
            <Button onClick={handleSubmit}>Connect</Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Connect;
