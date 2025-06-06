package graduate.req_server.util.client.ai;

import graduate.req_server.util.client.ai.dto.VectorResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class AiClient {

    private final WebClient aiWebClient;
    @Value("${ai.server.image-to-vector-endpoint}")
    private String imageToVectorPath;
    @Value("${ai.server.text-to-vector-endpoint}")
    private String textToVectorPath;

    public String vectorizeAndStore(List<String> imageIds) {
        return aiWebClient.post()
                .uri(imageToVectorPath)
                .bodyValue(imageIds)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public List<Float> textToVector(String text) {
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
