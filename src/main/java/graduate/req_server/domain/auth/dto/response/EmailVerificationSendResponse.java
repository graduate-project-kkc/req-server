package graduate.req_server.domain.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmailVerificationSendResponse {

    private final String verificationCode;
}
