import { useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
interface CheckMessagesProps {
    handleCheckNumber : (phoneNumberToCheck:string|number) =>void
}

const CheckMessages: React.FC<CheckMessagesProps> = ({handleCheckNumber}) => {
    const [error,setError] = useState<boolean>(false)
    const [phoneNumberToCheck , setPhoneNumberToCheck] = useState<string|number>()
    const handleSubmit = (e:any) =>{
        e.preventDefault();
        phoneNumberToCheck !=undefined &&  handleCheckNumber(phoneNumberToCheck)
    }
  return (
    <div style={{ margin: "20px 20px" }}>
      <Form>
        <Row>
          <Col md={9}>
            <FormGroup>
              <Label for="phoneNumber">Check Phone Number</Label>
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
                        setPhoneNumberToCheck(e.target.value)
                        setError(false)
                    }
                }}
                invalid={error}
              />
            </FormGroup>
          </Col>
          <Col md={3} >
            <div style={{marginTop:"30px"}}>
            <Button onClick={handleSubmit}>Check</Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CheckMessages;
