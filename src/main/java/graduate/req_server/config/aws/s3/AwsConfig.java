package graduate.req_server.config.aws.s3;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.translate.TranslateClient;

@Configuration
public class AwsConfig {

    @Value("${spring.cloud.aws.credentials.access-key}")
    private String accessKey;
    @Value("${spring.cloud.aws.credentials.secret-key}")
    private String secretKey;
    @Value("${spring.cloud.aws.s3.region}")
    private String region;

    @Bean
    public AwsCredentialsProvider customAwsCredentialsProvider() {
        return () -> new AwsCredentials() {
            @Override
            public String accessKeyId() {
                return accessKey;
            }
            @Override
            public String secretAccessKey() {
                return secretKey;
            }
        };
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .credentialsProvider(customAwsCredentialsProvider())
                .region(Region.of(region))
                .build();
    }

    @Bean
    public S3AsyncClient s3AsyncClient() {
        return S3AsyncClient.builder()
                .region(Region.of(region))
                .credentialsProvider(customAwsCredentialsProvider())
                .build();
    }

    @Bean
    public S3Utilities s3Utilities(S3Client s3Client) {
        return s3Client.utilities();
    }

    @Bean
    public TranslateClient translateClient() {
        return TranslateClient.builder()
                .region(Region.of(region))
                .credentialsProvider(customAwsCredentialsProvider())
                .build();
    }
}
