package graduate.req_server.domain.image.service;

import graduate.req_server.domain.image.dto.request.ImageRequest;
import graduate.req_server.domain.image.dto.response.ImageResponse;
import graduate.req_server.util.client.AiClient;
import graduate.req_server.util.file.MultipartUtils;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Client s3Client;
    private final AiClient aiClient;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Transactional
    public ImageResponse uploadAndProcess(ImageRequest request) {
        List<MultipartFile> files = request.getFiles();
        MultipartUtils.validateFiles(files);

        List<String> ids = files.stream().map(file -> {
            String ext = MultipartUtils.getExtension(file.getOriginalFilename());
            String id = java.util.UUID.randomUUID().toString();
            String key = "images/" + id + ext;
            try (InputStream is = file.getInputStream()) {
                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucket)
                                .key(key)
                                .build(),
                        RequestBody.fromInputStream(is, file.getSize())
                );
            } catch (IOException e) {
                //TODO Error
            }
            return id;
        }).collect(Collectors.toList());

        // AI 처리
        String status = aiClient.vectorizeAndStore(ids);
        return new ImageResponse(ids, status);
    }
}
