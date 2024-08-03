import React, { useState } from "react";
import './Login.css';
import { login } from "../../services/auth/authService";
import { useNavigate } from "react-router-dom";

import {
  Image,
  Card,
  CardHeader,
  Spacer,
  Input,
  Checkbox,
  CardBody,
  Button,
} from "@nextui-org/react";
import { Mail } from "./Mail";
import { Password } from "./Password";

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const { username, password } = formData;

    try {
      const data = await login(username, password);
      console.log("Login successful", data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="dark-bg"></div>
      <Card
        className="w-[40%] border-none"
        variant="bordered"
        isFooterBlurred
        radius="lg"
      >
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-center">
          <h2 className="font-bold text-large">Selfie App</h2>
          <Image
            alt="Woman listing to music"
            className="object-cover"
            // height={200}
            src="https://imgs.search.brave.com/KxMCBHVay_ukK_E8HEQe3U1aUIwB2qzAFX1BpXm6Sfc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9n/aXJsLWVhcnBob25l/cy10YWtpbmctc2Vs/ZmllLW91dGRvb3Jz/XzY1MTM5Ni0yMTM4/LmpwZz9zaXplPTYy/NiZleHQ9anBn"
          //width={200}
          />
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Input
              clearable
              bordered
              fullWidth
              color="default"
              size="lg"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              contentLeft={<Mail fill="currentColor" />}
            />
            <Spacer y={1} />
            <Input
              type="password"
              bordered
              fullWidth
              color="default"
              size="lg"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              contentLeft={<Password fill="currentColor" />}
              css={{ mb: "6px" }}
            />
            <div className="flex justify-between">
              <Checkbox>
                <p size={14}>Remember me</p>
              </Checkbox>
              <p size={14}>Forgot password?</p>
            </div>
            <Spacer y={1} />
            <Button type="submit" onClick={handleSubmit}>
              Sign in
            </Button>
          </form>
          {error && <p color="error">{error}</p>}
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
