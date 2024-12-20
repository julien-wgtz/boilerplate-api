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
  
  export interface ChangeEmailProps {
	lang: string;
	token: string;
  }
  const frontURL = process.env.FRONT_URL;
  const baseUrl = process.env.HOSTNAME;
  const port = process.env.PORT;

  export const ChangeEmail = ({
	lang,
	token,
  }: ChangeEmailProps) => {
	const confirmationUrl = `${frontURL}/${lang}/change-email?token=${token}`;
	return (
	  <Html>
		<Head />
		<Preview>
		  Changement d'email si vous n'êtes pas réseemble de ça ... 
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
			Changement d'email si vous n'êtes pas à l'origine de ça ... 			
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
  
  export default ChangeEmail;
  
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