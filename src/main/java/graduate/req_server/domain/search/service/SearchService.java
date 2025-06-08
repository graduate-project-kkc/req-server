package graduate.req_server.domain.search.service;

import graduate.req_server.domain.search.dto.request.SearchRequest;
import graduate.req_server.domain.search.dto.response.PhotoInfo;
import graduate.req_server.domain.search.dto.response.SearchResponse;
import graduate.req_server.util.client.ai.AiClient;
import graduate.req_server.util.client.pinecone.PineconeClient;
import graduate.req_server.util.client.s3.S3Service;
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
    private final S3Service s3Service;

    public SearchResponse searchByText(SearchRequest request) {
        log.debug("[SearchService] searchByText");

        double minScore = 0.12;

        List<Float> vector = aiClient.textToVector(request.getQuery());
        List<ScoredVectorWithUnsignedIndices> matches = pineconeClient.queryTopKWithScore(vector);

        List<PhotoInfo> photos = matches.stream()
                .filter(m -> m.getScore() >= minScore)
                .map(m -> {
                    String id = m.getId();
                    double score = m.getScore();

                    String url = s3Service.getFileUrl(id);
                    double size = s3Service.getFileSize(id);

                    return new PhotoInfo(url, size, score);
                }).toList();

        return new SearchResponse(photos);
    }
}
