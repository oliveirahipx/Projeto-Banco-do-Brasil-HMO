package com.seumonitor.api_tester.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// DTO para receber as credenciais do frontend
public class LoginRequest {
    private String email;
    private String password;

    public LoginRequest() {}

}