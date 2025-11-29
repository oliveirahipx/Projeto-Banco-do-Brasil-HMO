package com.seumonitor.api_tester.Repository;

import com.seumonitor.api_tester.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {

    // Método customizado que o Spring Data implementa automaticamente
    Optional<User> findByEmail(String email);
}