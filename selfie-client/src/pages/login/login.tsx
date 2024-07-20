import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { login } from "../../services/auth/authService";
import { useNavigate } from "react-router-dom";

const Login : React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
    setError(null);
		const { email, password } = formData;

    try {
      const data = await login(email, password);
      console.log('Login successful', data);
      navigate('/dashboard'); 
      // Handle successful login (e.g., redirect, load user data, etc.)
    } catch (err) {
      console.error('Login error', err);
      setError('Login failed. Please check your credentials.');
    }
	};

	return (
		<Container>
			<Row className="justify-content-md-center">
				<Col md="6">
					<h2>Input Form</h2>
					<Form onSubmit={handleSubmit}>
						<Form.Group controlId="formEmail">
							<Form.Label>Email address</Form.Label>
							<Form.Control
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Enter your email"
								required
							/>
						</Form.Group>

						<Form.Group controlId="formPassword">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Password"
								required
							/>
						</Form.Group>

						<Button variant="primary" type="submit">
							Submit
						</Button>
							{error && <p style={{ color: 'red' }}>{error}</p>}
					</Form>
				</Col>
			</Row>
		</Container>
	);
};

export default Login;
