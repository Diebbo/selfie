import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

const Login = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle form submission logic
		console.log("Form submitted:", formData);
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
					</Form>
				</Col>
			</Row>
		</Container>
	);
};

export default Login;
