package graduate.req_server.common.aop;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

@Slf4j
@Component
public class LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();

        filterChain.doFilter(request, responseWrapper);

        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        // --- 요청 정보 로깅 ---
        String requestBody = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        log.info("""

                        [REQUEST] {} {} - {}ms
                        Headers: {}
                        Body: {}
                        """,
                request.getMethod(),
                request.getRequestURI(),
                executionTime,
                getHeaders(request),
                requestBody.isBlank() ? "[EMPTY]" : requestBody);

        // --- 응답 정보 로깅 ---
        String responseBody = new String(responseWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);
        log.info("""
                        [RESPONSE] {} {} - Status: {}
                        Body: {}
                        """,
                request.getMethod(),
                request.getRequestURI(),
                responseWrapper.getStatus(),
                responseBody.isBlank() ? "[EMPTY]" : responseBody);

        responseWrapper.copyBodyToResponse();
    }

    private String getHeaders(HttpServletRequest request) {
        StringBuilder headers = new StringBuilder();
        request.getHeaderNames().asIterator()
                .forEachRemaining(headerName ->
                        headers.append(String.format("[%s: %s] ", headerName, request.getHeader(headerName)))
                );
        return headers.toString();
    }
}