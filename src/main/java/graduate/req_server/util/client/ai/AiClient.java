package graduate.req_server.util.client.ai;

import graduate.req_server.util.client.ai.dto.UploadResponse;
import graduate.req_server.util.client.ai.dto.VectorResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiClient {

    private final WebClient aiWebClient;
    @Value("${ai.server.image-to-vector-endpoint}")
    private String imageToVectorPath;
    @Value("${ai.server.text-to-vector-endpoint}")
    private String textToVectorPath;

    public UploadResponse vectorizeAndStore(List<String> imageIds) {
        log.debug("[AiClient] vectorizeAndStore");

        return aiWebClient.post()
                .uri(imageToVectorPath)
                .bodyValue(imageIds)
                .retrieve()
                .bodyToMono(UploadResponse.class)
                .block();
    }

    public List<Float> textToVector(String text) {
        log.debug("[AiClient] textToVector");

        VectorResponse response = aiWebClient.get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path(textToVectorPath)
                                .queryParam("query", text)
                                .build())
                .retrieve()
                .bodyToMono(VectorResponse.class)
                .block();

        if (response == null || response.getVector() == null) {
            return List.of();
        }

        return response.getVector();
    }
}
