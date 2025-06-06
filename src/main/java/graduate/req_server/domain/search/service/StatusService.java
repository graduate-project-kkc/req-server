package graduate.req_server.domain.search.service;

import graduate.req_server.domain.search.controller.StatusController;
import graduate.req_server.domain.search.dto.request.SearchRequest;
import graduate.req_server.domain.search.dto.response.SearchResponse;
import graduate.req_server.domain.search.dto.response.StatusResponse;
import graduate.req_server.util.client.AiClient;
import graduate.req_server.util.client.PineconeClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatusService {


    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${spring.cloud.aws.s3.region}")
    private String region;
    private final S3Client s3Client;


    public StatusResponse getStats(String prefix) {
        long totalSize = 0L;
        int fileCount = 0;
        String continuationToken = null;

        ListObjectsV2Response result;
        do {
            ListObjectsV2Request request = ListObjectsV2Request.builder()
                    .bucket(bucket)
                    .prefix(prefix+"/")
                    .continuationToken(continuationToken)
                    .build();


            result = s3Client.listObjectsV2(request);
            List<S3Object> contents = result.contents();
            for (S3Object object : contents) {
                if(object.key().endsWith("/")) {
                    //폴더 파일 skip
                    continue;
                }
                totalSize += object.size(); // bytes
                fileCount++;
                System.out.println(object.key()+":"+object.size());
            }

            continuationToken = result.nextContinuationToken();
        } while (result.isTruncated());

        return new StatusResponse(formatBytes(totalSize), fileCount);
    }

    public static String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char unit = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), unit);
    }

    //public record PhotoStats(int count, long totalBytes) {}
}