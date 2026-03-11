import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import HeadingWithLogo from '../components/typography/HeadingWithLogo';
import Button from '../components/buttons/Button';
import { FormGroup } from '../components/forms/FormGroup';
import { Label } from '../components/forms/Label';
import { Input } from '../components/forms/Input';
import { Form } from '../components/forms/Form';
import RelativeWrapper from '../components/layout/RelativeWrapper';
import { useAuth } from '../hooks/useAuth';
import useScrollToTopOnPageLoad from '../hooks/useScrollToTopOnPageLoad';

/**
 * Login Page Component
 * Handles user authentication
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login, loading } = useAuth();

  useScrollToTopOnPageLoad();

  const { email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <RelativeWrapper>
      <Container
        fullHeight
        flexDirection="column"
        justifyContent="center"
        contentCenteredMobile
        alignItems="center"
        padding="6rem 2rem 2rem 2rem"
      >
        <Form onSubmit={handleSubmit}>
          <HeadingWithLogo textCentered hideIconOnMobile={false}>
            Login
          </HeadingWithLogo>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
              autoComplete="current-password"
            />
          </FormGroup>
          <Button type="submit" primary disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Button as={Link} to="/register" secondary style={{ marginTop: '1rem' }}>
            Don't have an account? Register
          </Button>
          <Button as={Link} to="/" secondary style={{ marginTop: '0.5rem' }}>
            Back to Home
          </Button>
        </Form>
      </Container>
    </RelativeWrapper>
  );
};

export default Login;
