package graduate.req_server.util.ai;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class AiService {

    @Value("${ai.server-url}")
    private String aiUrl;
    private final WebClient client;

    public AiService() {
        this.client = WebClient.builder().baseUrl(aiUrl).build();
    }

    public String process(List<String> imageIds) {
        return client.post()
                .bodyValue(imageIds)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
