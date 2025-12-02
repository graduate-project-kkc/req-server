package graduate.req_server.util.client.s3;

import graduate.req_server.common.exception.CustomException;
import graduate.req_server.common.exception.ErrorCode;
import graduate.req_server.config.aws.s3.S3Properties;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;
    private final S3Properties properties;
    private final S3Utilities s3Utilities;

    public String uploadFile(MultipartFile file, String userId) {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = StringUtils.getFilenameExtension(originalFilename);
        String uniqueFileName = UUID.randomUUID() + "." + fileExtension;

        String key = userId + "/" + uniqueFileName;

        try (InputStream is = file.getInputStream()) {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(properties.getBucket())
                            .key(key)
                            .build(),
                    RequestBody.fromInputStream(is, file.getSize())
            );
        } catch (IOException e) {
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED);
        }
        return key;
    }

    public void deleteFile(String key) {
        s3Client.deleteObject(builder -> builder.bucket(properties.getBucket()).key(key));
    }

    public String getFileUrl(String key) {
        return s3Utilities.getUrl(
                GetUrlRequest.builder()
                        .bucket(properties.getBucket())
                        .key(key)
                        .build()
            ).toExternalForm();
    }

    public double getFileSize(String key) {
        long bytes;
        try {
            bytes = s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(properties.getBucket())
                    .key(key)
                    .build())
                    .contentLength();
        } catch (NoSuchKeyException e) {
            bytes = 0L;
        }

        return bytesToMB(bytes);
    }

    private double bytesToMB(long bytes) {
        double mb = bytes / (1024.0 * 1024.0);
        return Math.round(mb * 10) / 10.0;
    }
}
