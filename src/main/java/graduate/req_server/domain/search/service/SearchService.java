package graduate.req_server.domain.search.service;

import graduate.req_server.domain.search.dto.request.SearchRequest;
import graduate.req_server.domain.search.dto.response.PhotoInfo;
import graduate.req_server.domain.search.dto.response.SearchResponse;
import graduate.req_server.util.client.ai.AiClient;
import graduate.req_server.util.client.pinecone.PineconeClient;
import graduate.req_server.util.client.s3.S3Service;
import graduate.req_server.util.security.SecurityUtil;
import graduate.req_server.util.client.translate.TranslationService;
import io.pinecone.unsigned_indices_model.ScoredVectorWithUnsignedIndices;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final AiClient aiClient;
    private final PineconeClient pineconeClient;
    private final S3Service s3Service;
    private final TranslationService translationService;

    public SearchResponse searchByText(SearchRequest request) {
        log.debug("[SearchService] searchByText");

        String userId = SecurityUtil.getCurrentUserId();

        String query = translationService.translate(request.getQuery(), "auto", "en");
        log.info("translation result: {}", query);

        List<Float> vector = aiClient.textToVector(query);
        return getSearchResponse(userId, vector);
    }

    public SearchResponse searchByImage(MultipartFile image) {
        log.debug("[SearchService] searchByImage");

        String userId = SecurityUtil.getCurrentUserId();

        List<Float> vector = aiClient.imageToVector(image);
        return getSearchResponse(userId, vector);
    }


    private SearchResponse getSearchResponse(String userId, List<Float> vector) {
        double minScore = 0.1;
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
