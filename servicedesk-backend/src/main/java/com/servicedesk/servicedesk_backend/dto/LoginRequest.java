package com.servicedesk.servicedesk_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Email is Required")
    @Email(message = "Invalid Email format")
    private String email;

    @NotBlank(message = "Password is Required")
    private String password;

    public LoginRequest(){}
    public LoginRequest(String email, String password){
        this.email = email;
        this.password = password;
    }
    public String getEmail(){
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
