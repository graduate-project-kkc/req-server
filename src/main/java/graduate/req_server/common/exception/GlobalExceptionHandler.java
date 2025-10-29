package graduate.req_server.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException e) {
        log.error(e.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(e.getErrorCode().getStatus().value())
                .message(e.getErrorCode().getMessage())
                .build();
        return new ResponseEntity<>(errorResponse, e.getErrorCode().getStatus());
    }
}