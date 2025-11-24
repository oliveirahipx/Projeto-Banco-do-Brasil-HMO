package com.seumonitor.api_tester.Controller;

import com.seumonitor.api_tester.DTO.LoginRequest;
import com.seumonitor.api_tester.Model.User;
import com.seumonitor.api_tester.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint para autenticação de usuário.
     * Recebe LoginRequest (email, password) e retorna o usuário (ou erro).
     */
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest loginRequest) {

        Optional<User> userOptional = userService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        if (userOptional.isPresent()) {
            // Sucesso: Retorna o objeto User com status 200
            return ResponseEntity.ok(userOptional.get());
        } else {
            // Falha: Retorna status 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}