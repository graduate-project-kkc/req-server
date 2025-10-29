package graduate.req_server.domain.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String verificationCode;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Builder
    public EmailVerification(String email, String verificationCode, LocalDateTime expiryTime) {
        this.email = email;
        this.verificationCode = verificationCode;
        this.expiryTime = expiryTime;
    }

    public void updateVerificationInfo(String verificationCode, LocalDateTime expiryTime) {
        this.verificationCode = verificationCode;
        this.expiryTime = expiryTime;
    }
}