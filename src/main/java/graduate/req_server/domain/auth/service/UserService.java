package graduate.req_server.domain.auth.service;

import graduate.req_server.common.exception.CustomException;
import graduate.req_server.common.exception.ErrorCode;
import graduate.req_server.domain.auth.dto.request.EmailVerificationRequest;
import graduate.req_server.domain.auth.dto.request.LoginRequest;
import graduate.req_server.domain.auth.dto.request.SignUpRequest;
import graduate.req_server.domain.auth.dto.response.LoginResponse;
import graduate.req_server.domain.auth.entity.EmailVerification;
import graduate.req_server.domain.auth.entity.User;
import graduate.req_server.domain.auth.repository.EmailVerificationRepository;
import graduate.req_server.domain.auth.repository.UserRepository;
import graduate.req_server.util.jwt.JwtTokenProvider;
import graduate.req_server.util.mail.EmailService;
import java.time.LocalDateTime;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;

    private static final long EMAIL_VERIFICATION_EXPIRY_MINUTES = 5;
    private static final Random RANDOM = new Random();

    @Value("${app.service-url}")
    private String serviceUrl;

    @Transactional
    public void sendVerificationEmail(EmailVerificationRequest request) {
        String email = request.getEmail();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new CustomException(ErrorCode.EMAIL_DUPLICATION);
        }

        String verificationCode = createVerificationCode();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(EMAIL_VERIFICATION_EXPIRY_MINUTES);

        // 기존 인증 정보가 있으면 업데이트, 없으면 새로 생성
        EmailVerification verification = emailVerificationRepository.findByEmail(email)
                .orElseGet(() -> EmailVerification.builder().email(email).build());

        verification.updateVerificationInfo(verificationCode, expiryTime);

        emailVerificationRepository.save(verification);

        String body = "인증번호: " + verificationCode + "\n\n" + "서비스 바로가기: " + serviceUrl;
        emailService.sendEmail(email, "회원가입 인증번호", body);
    }

    @Transactional
    public void signUp(SignUpRequest request) {
        EmailVerification verification = emailVerificationRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.VERIFICATION_CODE_NOT_FOUND));

        if (LocalDateTime.now().isAfter(verification.getExpiryTime())) {
            throw new CustomException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }

        if (!verification.getVerificationCode().equals(request.getVerificationCode())) {
            throw new CustomException(ErrorCode.VERIFICATION_CODE_MISMATCH);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .username(request.getUsername())
                .build();

        userRepository.save(user);
        emailVerificationRepository.delete(verification);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        return new LoginResponse(jwtTokenProvider.createToken(user.getId()), user.getUsername());
    }

    private String createVerificationCode() {
        int code = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(code);
    }
}