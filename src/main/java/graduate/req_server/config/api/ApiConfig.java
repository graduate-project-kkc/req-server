package graduate.req_server.config.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class ApiConfig {

    @Value("${ai.server.base-url}")
    private String aiUrl;

    @Value("${vector-db.url}")
    private String vectorDbUrl;

    @Bean(name = "aiWebClient")
    public WebClient aiWebClient() {
        return WebClient.builder()
                .baseUrl(aiUrl)
                .build();
    }

    @Bean(name = "vectorDbWebClient")
    public WebClient vectorDbWebClient() {
        return WebClient.builder()
                .baseUrl(vectorDbUrl)
                .build();
    }
}
