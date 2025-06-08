package graduate.req_server.domain.image.service;

import graduate.req_server.domain.image.dto.request.ImageRequest;
import graduate.req_server.util.client.ai.AiClient;
import graduate.req_server.util.client.ai.dto.UploadResponse;
import graduate.req_server.util.client.s3.S3Service;
import graduate.req_server.util.file.MultipartUtils;
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

    public UploadResponse uploadAndProcess(ImageRequest request) {
        log.debug("[ImageService] uploadAndProcess");

        List<MultipartFile> files = request.getFiles();
        MultipartUtils.validateFiles(files);

        List<String> keys = files.stream()
                .map(s3Service::uploadFile)
                .toList();

        // AI 처리
        return aiClient.vectorizeAndStore(keys);
    }
}
