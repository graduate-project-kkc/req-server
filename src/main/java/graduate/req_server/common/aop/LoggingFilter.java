package graduate.req_server.common.aop;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

@Slf4j
@Component
public class LoggingFilter extends OncePerRequestFilter {

        // 로깅 제외할 확장자 리스트
        private static final String[] STATIC_RESOURCES = {
                ".css", ".js", ".html", ".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".ttf"
        };

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {

                if (isStaticResource(request)) {
                        filterChain.doFilter(request, response);
                        return;
                }

                ContentCachingRequestWrapper requestWrapper = wrapRequest(request);
                ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

                long startTime = System.currentTimeMillis();

                try {
                        // 실제 비즈니스 로직 실행
                        filterChain.doFilter(requestWrapper, responseWrapper);
                } finally {
                        long endTime = System.currentTimeMillis();
                        long executionTime = endTime - startTime;

                        if (responseWrapper.getStatus() >= 400) {
                                logError(requestWrapper, responseWrapper, executionTime);
                        }

                        responseWrapper.copyBodyToResponse();
                }
        }

        private boolean isStaticResource(HttpServletRequest request) {
                String uri = request.getRequestURI().toLowerCase();
                for (String ext : STATIC_RESOURCES) {
                        if (uri.endsWith(ext)) {
                                return true;
                        }
                }
                return false;
        }

        private void logError(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response, long executionTime) {
                try {
                        // 요청 본문 가져오기 (파일 업로드는 내용 생략)
                        String requestBody = "[Multipart/File - Body Skipped]";
                        if (!isMultipart(request)) {
                                byte[] reqContent = request.getContentAsByteArray();
                                requestBody = reqContent.length > 0 ? new String(reqContent, StandardCharsets.UTF_8) : "[EMPTY]";
                        }

                        // 응답 본문 가져오기
                        byte[] resContent = response.getContentAsByteArray();
                        String responseBody = resContent.length > 0 ? new String(resContent, StandardCharsets.UTF_8) : "[EMPTY]";

                        // 에러 로그 출력 (데이터독 Trace ID 자동 포함)
                        log.error("""
                    
                    🚨 [HTTP ERROR] {} {} ({}ms)
                    --- Request ---
                    Headers: {}
                    Body: {}
                    --- Response ({}) ---
                    Body: {}
                    """,
                                request.getMethod(),
                                request.getRequestURI(),
                                executionTime,
                                getHeaders(request),
                                requestBody,
                                response.getStatus(),
                                responseBody
                        );
                } catch (Exception e) {
                        log.error("Logging failed", e);
                }
        }

        private ContentCachingRequestWrapper wrapRequest(HttpServletRequest request) {
            if (!(request instanceof ContentCachingRequestWrapper)) {
                return new ContentCachingRequestWrapper(request);
            }
            return (ContentCachingRequestWrapper) request;
        }

        private boolean isMultipart(HttpServletRequest request) {
                return request.getContentType() != null &&
                        request.getContentType().startsWith(MediaType.MULTIPART_FORM_DATA_VALUE);
        }

        private String getHeaders(HttpServletRequest request) {
                StringBuilder headers = new StringBuilder();
                request.getHeaderNames().asIterator()
                        .forEachRemaining(headerName -> headers.append(
                                String.format("[%s: %s] ", headerName, request.getHeader(headerName))));
                return headers.toString();
        }
}