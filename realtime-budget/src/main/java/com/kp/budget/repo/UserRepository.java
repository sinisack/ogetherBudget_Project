// com.kp.budget.repo.UserRepository
package com.kp.budget.repo;
import com.kp.budget.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
