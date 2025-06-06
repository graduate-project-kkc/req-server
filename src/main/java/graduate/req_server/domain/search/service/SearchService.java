package graduate.req_server.domain.search.service;

import graduate.req_server.domain.search.dto.request.SearchRequest;
import graduate.req_server.domain.search.dto.response.SearchResponse;
import graduate.req_server.util.client.ai.AiClient;
import graduate.req_server.util.client.PineconeClient;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final AiClient aiClient;
    private final PineconeClient pineconeClient;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${spring.cloud.aws.s3.region}")
    private String region;

    private final String prefix ="images";

    public SearchResponse searchByText(SearchRequest request) {
        List<Float> vector = aiClient.textToVector(request.getQuery());
        List<String> keys = pineconeClient.queryTopK(vector);
        List<String> urls = keys.stream()
                .map(key -> String.format("https://%s.s3.%s.amazonaws.com/%s/%s", bucket, region,prefix, key))
                .collect(Collectors.toList());
        return new SearchResponse(urls);
    }
}