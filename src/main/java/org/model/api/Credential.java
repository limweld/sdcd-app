package org.model.api;

public class Credential {

	private String username;
	
	private String password;

	private boolean passHashIsCorrect;
	
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}


	public boolean isPassHashIsCorrect() {
		return passHashIsCorrect;
	}


	public void setPassHashIsCorrect(boolean passHashIsCorrect) {
		this.passHashIsCorrect = passHashIsCorrect;
	}
	
	
}
