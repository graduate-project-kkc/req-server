package graduate.req_server.util.client;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class VectorDbClient {

    private final WebClient vectorDbWebClient;

    @Value("${vector-db.top-k}")
    private int topK;

    public List<String> queryTopK(List<Double> vector) {
        QueryRequest req = new QueryRequest(vector, topK);
        return vectorDbWebClient.post()
                .bodyValue(req)
                .retrieve()
                .bodyToFlux(String.class)
                .collectList()
                .block();
    }

    private record QueryRequest(List<Double> vector, int topK) {}
}
