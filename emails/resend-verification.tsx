import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Img,
	Preview,
	Section,
	Text,
  } from '@react-email/components';
  import * as React from 'react';
  
  export interface ConfirmationSigninProps {
	token: string;
  }
  const frontURL = process.env.FRONT_URL;
  const baseUrl = process.env.HOSTNAME;
  const port = process.env.PORT;

  export const ResendVerification = ({
	token,
  }: ConfirmationSigninProps) => {
	const confirmationUrl = `${frontURL}/auth/confirm?token=${token}`;
	return (
	  <Html>
		<Head />
		<Preview>
		  The sales intelligence platform that helps you uncover qualified leads.
		</Preview>
		<Body style={main}>
		  <Container style={container}>
			<Img
			  src={`https://${baseUrl}:${port}/logo.png`}
			  width="120"
			  height="170"
			  alt="Nexus"
			  style={logo}
			/>
			<Text style={paragraph}>Bonjour,</Text>
			<Text style={paragraph}>
			  Email de re confirmation de l'adresse mail
			</Text>
			<Text style={paragraph}>
			  <strong>Valider l'adresse mail</strong>
			</Text>
			<Section style={btnContainer}>
			  <Button style={button} href={confirmationUrl}>
				Confirmer mon compte
			  </Button>
			</Section>
		  </Container>
		</Body>
	  </Html>
	);
  };
  
  export default ResendVerification;
  
  const main = {
	backgroundColor: '#ffffff',
	fontFamily:
	  '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
	margin: '0 auto',
	padding: '20px 0 48px',
  };
  
  const logo = {
	margin: '0 auto',
  };
  
  const paragraph = {
	fontSize: '16px',
	lineHeight: '26px',
  };
  
  const bold = {
	fontStyle: 'bold',
  };
  const btnContainer = {
	textAlign: 'center' as const,
  };
  
  const button = {
	backgroundColor: '#5F51E8',
	borderRadius: '3px',
	color: '#fff',
	fontSize: '16px',
	textDecoration: 'none',
	textAlign: 'center' as const,
	display: 'block',
	padding: '12px',
  };
  
  const hr = {
	borderColor: '#cccccc',
	margin: '20px 0',
  };
  
  const footer = {
	color: '#8898aa',
	fontSize: '12px',
  };