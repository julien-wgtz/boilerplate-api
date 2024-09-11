import { Res } from '@nestjs/common';
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
  import i18n from '../i18n';
  export interface ResetPasswordProps {
	token: string;
  }
  const frontURL = process.env.FRONT_URL;
  const baseUrl = process.env.HOSTNAME;
  const port = process.env.PORT;

  export const ResetPassword = ({
	token,
  }: ResetPasswordProps) => {
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
			<Text>{i18n.t('email.reset-password.body')}</Text>
			<Text style={paragraph}>
			  Si vous avez demandé un changement de mot de passe, veuillez cliquer sur le lien ci-dessous. Si vous n'avez pas demandé de changement de mot de passe, ignorez cet email.
			</Text>
			<Text style={paragraph}>
			  <strong>Changer de mot passe</strong>
			</Text>
			<Section style={btnContainer}>
			  <Button style={button} href={confirmationUrl}>
				Nouveau mot de passe
			  </Button>
			</Section>
		  </Container>
		</Body>
	  </Html>
	);
  };
  
  export default ResetPassword;
  
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