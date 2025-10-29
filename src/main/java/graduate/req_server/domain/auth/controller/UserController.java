package graduate.req_server.domain.auth.controller;

import graduate.req_server.domain.auth.dto.request.EmailVerificationRequest;
import graduate.req_server.domain.auth.dto.request.LoginRequest;
import graduate.req_server.domain.auth.dto.request.SignUpRequest;
import graduate.req_server.domain.auth.dto.response.EmailVerificationSendResponse;
import graduate.req_server.domain.auth.dto.response.LoginResponse;
import graduate.req_server.domain.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    /**
     * 회원가입 인증번호 요청 API
     */
    @PostMapping("/email-verification")
    public ResponseEntity<Void> sendVerificationEmail(@Valid @RequestBody EmailVerificationRequest request) {
        userService.sendVerificationEmail(request);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원가입 API
     */
    @PostMapping("/signup")
    public ResponseEntity<Void> signUp(@Valid @RequestBody SignUpRequest request) {
        userService.signUp(request);
        return ResponseEntity.ok().build();
    }

    /**
     * 로그인 API
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = userService.login(request);
        return ResponseEntity.ok(new LoginResponse(token));
    }
}
