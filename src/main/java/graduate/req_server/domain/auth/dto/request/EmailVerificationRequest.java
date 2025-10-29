package graduate.req_server.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EmailVerificationRequest {
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;
}
