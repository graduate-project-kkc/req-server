package graduate.req_server.util.client.ai;

import graduate.req_server.util.client.ai.dto.UploadResponse;
import graduate.req_server.util.client.ai.dto.VectorResponse;
import graduate.req_server.util.client.ai.dto.VectorizeRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class AiClient {

    private final WebClient aiWebClient;
    @Value("${ai.server.image-to-vector-endpoint}")
    private String imageToVectorPath;
    @Value("${ai.server.search-image-to-vector-endpoint}")
    private String searchImageToVectorPath;
    @Value("${ai.server.text-to-vector-endpoint}")
    private String textToVectorPath;

    public UploadResponse vectorizeAndStore(List<String> imageIds, String userId) {
        VectorizeRequest requestBody = new VectorizeRequest(imageIds, userId);

        return aiWebClient.post()
                .uri(imageToVectorPath)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(UploadResponse.class)
                .block();
    }

    public List<Float> imageToVector(MultipartFile image) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", image.getResource());

        VectorResponse response = aiWebClient.post()
                .uri(searchImageToVectorPath)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(body))
                .retrieve()
                .bodyToMono(VectorResponse.class)
                .block();

        if (response == null || response.getVector() == null) {
            return List.of();
        }

        return response.getVector();
    }

    public List<Float> textToVector(String text) {
        VectorResponse response = aiWebClient.get()
                .uri(uriBuilder -> uriBuilder
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
