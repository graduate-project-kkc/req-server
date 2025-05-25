package graduate.req_server.config.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiConfig {

    @Value("${ai.server.base-url}")
    private String aiUrl;

    @Bean(name = "aiWebClient")
    public WebClient aiWebClient() {
        return WebClient.builder()
                .baseUrl(aiUrl)
                .build();
    }
}
