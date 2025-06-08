package graduate.req_server.domain.search.service;

import graduate.req_server.domain.search.dto.request.SearchRequest;
import graduate.req_server.domain.search.dto.response.PhotoInfo;
import graduate.req_server.domain.search.dto.response.SearchResponse;
import graduate.req_server.util.client.ai.AiClient;
import graduate.req_server.util.client.PineconeClient;
import io.pinecone.unsigned_indices_model.ScoredVectorWithUnsignedIndices;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final AiClient aiClient;
    private final PineconeClient pineconeClient;
    private final S3Client s3Client;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${spring.cloud.aws.s3.region}")
    private String region;

    public SearchResponse searchByText(SearchRequest request) {
        log.info("[SearchService] searchByText");

        double minScore = 0.12;

        List<Float> vector = aiClient.textToVector(request.getQuery());
        List<ScoredVectorWithUnsignedIndices> matches = pineconeClient.queryTopKWithScore(vector);

        List<PhotoInfo> photos = matches.stream()
                .filter(m -> m.getScore() >= minScore)
                .map(m -> {
                    String id = m.getId();
                    double score = m.getScore();

                    String key = "images/" + id;
                    String url = String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region,
                            key);

                    double size;
                    try {
                        size = s3Client.headObject(
                                HeadObjectRequest.builder()
                                        .bucket(bucket).key(key)
                                        .build()
                        ).contentLength();
                    } catch (NoSuchKeyException e) {
                        size = 0L;
                    }
                    size /= (1024.0 * 1024.0);
                    size = Math.round(size * 10) / 10.0;

                    return new PhotoInfo(url, size, score);
                }).toList();

        return new SearchResponse(photos);
    }
}
