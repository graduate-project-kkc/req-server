package graduate.req_server.domain.search.service;

import graduate.req_server.domain.search.dto.request.SearchRequest;
import graduate.req_server.domain.search.dto.response.PhotoInfo;
import graduate.req_server.domain.search.dto.response.SearchResponse;
import graduate.req_server.util.client.ai.AiClient;
import graduate.req_server.util.client.pinecone.PineconeClient;
import graduate.req_server.util.client.s3.S3Service;
import graduate.req_server.util.security.SecurityUtil;
import io.pinecone.unsigned_indices_model.ScoredVectorWithUnsignedIndices;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final AiClient aiClient;
    private final PineconeClient pineconeClient;
    private final S3Service s3Service;

    public SearchResponse searchByText(SearchRequest request) {
        log.debug("[SearchService] searchByText");

        double minScore = 0.1;

        String userId = SecurityUtil.getCurrentUserId();

        List<Float> vector = aiClient.textToVector(request.getQuery());
        List<ScoredVectorWithUnsignedIndices> matches = pineconeClient.queryTopKWithUserId(vector, userId);

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
