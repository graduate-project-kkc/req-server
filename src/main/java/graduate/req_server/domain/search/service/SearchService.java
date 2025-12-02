package graduate.req_server.domain.search.service;

import graduate.req_server.domain.search.dto.request.SearchRequest;
import graduate.req_server.domain.search.dto.response.PhotoInfo;
import graduate.req_server.domain.search.dto.response.SearchResponse;
import graduate.req_server.domain.photo.entity.Photo;
import graduate.req_server.domain.photo.repository.PhotoRepository;
import graduate.req_server.util.client.ai.AiClient;
import graduate.req_server.util.client.pinecone.PineconeClient;
import graduate.req_server.util.client.s3.S3Service;
import graduate.req_server.util.client.translate.TranslationService;
import graduate.req_server.util.security.SecurityUtil;
import io.pinecone.unsigned_indices_model.ScoredVectorWithUnsignedIndices;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final AiClient aiClient;
    private final PineconeClient pineconeClient;
    private final S3Service s3Service;
    private final TranslationService translationService;
    private final PhotoRepository photoRepository;

    @Transactional(readOnly = true)
    public SearchResponse searchByText(SearchRequest request) {
        log.debug("[SearchService] searchByText");

        String userId = SecurityUtil.getCurrentUserId();

        String query = translationService.translate(request.getQuery(), "auto", "en");
        log.info("translation result: {}", query);

        if (query.trim().split("\\s+").length == 1) {
            query = "a photo of " + query;
            log.info("modified query: {}", query);
        }

        List<Float> vector = aiClient.textToVector(query);
        return getSearchResponse(userId, vector, query);
    }

    @Transactional(readOnly = true)
    public SearchResponse searchByImage(MultipartFile image) {
        log.debug("[SearchService] searchByImage");

        String userId = SecurityUtil.getCurrentUserId();

        List<Float> vector = aiClient.imageToVector(image);
        return getSearchResponse(userId, vector, "");
    }

    private SearchResponse getSearchResponse(String userId, List<Float> vector, String query) {
        double minScore = 0.1;
        List<ScoredVectorWithUnsignedIndices> matches = pineconeClient.queryTopKWithUserId(vector, userId);

        List<String> ids = matches.stream()
                .filter(m -> m.getScore() >= minScore)
                .map(ScoredVectorWithUnsignedIndices::getId)
                .toList();

        Map<String, Photo> photoMap = photoRepository.findByS3KeyIn(ids).stream()
                .collect(Collectors.toMap(Photo::getS3Key, Function.identity()));

        List<PhotoInfo> photos = matches.stream()
                .filter(m -> m.getScore() >= minScore)
                .map(m -> {
                    String id = m.getId();
                    double score = m.getScore();

                    String url = s3Service.getFileUrl(id);
                    double size = s3Service.getFileSize(id);

                    Photo photo = photoMap.get(id);
                    String photoId = photo != null ? photo.getId() : null;
                    String originalFilename = photo != null ? photo.getOriginalFilename() : null;
                    String takenDate = photo != null && photo.getTakenDate() != null ? photo.getTakenDate().toString()
                            : null;

                    return PhotoInfo.builder()
                            .id(photoId)
                            .url(url)
                            .size(size)
                            .score(score)
                            .originalFilename(originalFilename)
                            .takenDate(takenDate)
                            .build();
                }).toList();

        return new SearchResponse(photos, query);
    }
}
