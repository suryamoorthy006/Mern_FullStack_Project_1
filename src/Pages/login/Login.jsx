import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const API_URL = 'http://localhost:4000/api/auth';

function Login({ onLogin }) {
	const [isRegistering, setIsRegistering] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setMessage('');
		setIsLoading(true);

		try {
			const endpoint = isRegistering ? 'register' : 'login';
			const response = await axios.post(`${API_URL}/${endpoint}`, { email, password });
			localStorage.setItem('token', response.data.token);
			onLogin();
			setMessage(isRegistering ? 'Account created. You are signed in.' : 'Welcome back. You are signed in.');
			setPassword('');
		} catch (error) {
			setMessage(error.response?.data?.message || 'The server could not be reached.');
		} finally {
			setIsLoading(false);
		}
	};

	const toggleMode = () => {
		setIsRegistering((currentMode) => !currentMode);
		setMessage('');
	};

	return (
		<main className="login-page">
			<section className="login-panel" aria-labelledby="login-title">
				<h1 id="login-title">{isRegistering ? 'Create your account' : 'Welcome back'}</h1>
				<p className="login-intro">
					{isRegistering ? 'Start collecting your thoughts in one place.': 'Sign in to access your notes and manage them easily.'}
				</p>

				<form className="login-form" onSubmit={handleSubmit}>
					<label htmlFor="email">Email</label>
					<input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

					<label htmlFor="password">Password</label>
					<input id="password" type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required />

					<button className="login-submit" type="submit" disabled={isLoading}>
						{isLoading ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
					</button>
				</form>

				{message && <p className="login-message" role="status">{message}</p>}
				<button className="mode-toggle" type="button" onClick={toggleMode}>
					{isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
				</button>
			</section>
		</main>
	);
}

export default Login;
