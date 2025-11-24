package com.seumonitor.api_tester.Repository;

import com.seumonitor.api_tester.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // Importante para lidar com usuários que não existem

// Interface para interagir com a tabela User
public interface UserRepository extends JpaRepository<User, Long> {

    // Método customizado que o Spring Data implementa automaticamente
    Optional<User> findByEmail(String email);
}