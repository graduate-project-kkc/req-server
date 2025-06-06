package graduate.req_server.util.client;

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
        return aiWebClient.get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path(textToVectorPath)
                                .queryParam("text", text)
                                .build())
                .retrieve()
                .bodyToFlux(Float.class)
                .collectList()
                .block();
    }
}
