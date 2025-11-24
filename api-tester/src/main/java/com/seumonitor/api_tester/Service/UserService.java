package com.seumonitor.api_tester.Service;

import com.seumonitor.api_tester.Model.User;
import com.seumonitor.api_tester.Repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;
import jakarta.annotation.PostConstruct; // Para rodar código logo após a inicialização

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Simulação de Autenticação: Valida email e senha.
     */
    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Simulação de verificação de senha
            if (user.getPassword().equals(password)) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }


    @PostConstruct
    public void setupInitialUser() {
        if (userRepository.count() == 0) {
            User initialUser = new User(
                    "Caio Dev",
                    "caio@exemplo.com",
                    "123456", // Senha de exemplo
                    "API Pagamento",
                    "https://localhost:0000.com"
            );
            userRepository.save(initialUser);
            System.out.println("Usuário inicial criado: caio@exemplo.com / 123456");
        }
    }

    /**
     * Busca um usuário pelo email.
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

}