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
 * Register Page Component
 * Handles new user registration
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });
  const { register, loading } = useAuth();

  useScrollToTopOnPageLoad();

  const { name, email, password, password2 } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(name, email, password, password2);
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
            Register
          </HeadingWithLogo>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
              minLength="2"
              autoComplete="name"
            />
          </FormGroup>
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
              placeholder="Enter your password (min 6 characters)"
              minLength="6"
              autoComplete="new-password"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password2">Confirm Password</Label>
            <Input
              id="password2"
              type="password"
              name="password2"
              value={password2}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              minLength="6"
              autoComplete="new-password"
            />
          </FormGroup>
          <Button type="submit" primary disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Button as={Link} to="/login" secondary style={{ marginTop: '1rem' }}>
            Already have an account? Login
          </Button>
          <Button as={Link} to="/" secondary style={{ marginTop: '0.5rem' }}>
            Back to Home
          </Button>
        </Form>
      </Container>
    </RelativeWrapper>
  );
};

export default Register;
