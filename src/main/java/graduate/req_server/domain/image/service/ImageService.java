package graduate.req_server.domain.image.service;

import graduate.req_server.domain.image.dto.request.ImageRequest;
import graduate.req_server.domain.photo.entity.Photo;
import graduate.req_server.domain.photo.repository.PhotoRepository;
import graduate.req_server.util.client.ai.AiClient;
import graduate.req_server.util.client.ai.dto.UploadResponse;
import graduate.req_server.util.client.s3.S3Service;
import graduate.req_server.util.file.MetadataExtractorUtil;
import graduate.req_server.util.file.MultipartUtils;
import graduate.req_server.util.security.SecurityUtil;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Service s3Service;
    private final AiClient aiClient;
    private final PhotoRepository photoRepository;

    public UploadResponse uploadAndProcess(ImageRequest request) {
        String userId = SecurityUtil.getCurrentUserId();

        List<MultipartFile> files = request.getFiles();
        MultipartUtils.validateFiles(files);

        List<String> keys = new ArrayList<>();
        for (MultipartFile file : files) {
            String key = s3Service.uploadFile(file, userId);
            keys.add(key);

            LocalDateTime takenDate = MetadataExtractorUtil.extractTakenDate(file);
            Photo photo = Photo.builder()
                    .userId(userId)
                    .s3Key(key)
                    .originalFilename(file.getOriginalFilename())
                    .takenDate(takenDate)
                    .build();
            photoRepository.save(photo);
        }

        return aiClient.vectorizeAndStore(keys, userId);
    }
}
