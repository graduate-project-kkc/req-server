package graduate.req_server.util.security;

import graduate.req_server.common.exception.CustomException;
import graduate.req_server.common.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {
    private SecurityUtil() { }

    public static String getCurrentUserId() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new CustomException(ErrorCode.AUTHENTICATION_NOT_EXIST);
        }

        return authentication.getName();
    }
}
