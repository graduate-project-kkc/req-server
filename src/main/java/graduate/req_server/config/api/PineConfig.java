package graduate.req_server.config.api;

import io.pinecone.clients.Index;
import io.pinecone.clients.Pinecone;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PineConfig {
    @Value("${pinecone.api-key}")
    private String apiKey;

    @Value("${pinecone.index-name}")
    private String indexName;

    //Control Plane HTTP client 생성
    @Bean
    public Pinecone pinecone() {
        return new Pinecone.Builder(apiKey)
                .build();
    }

    // indexName을 매개변수로 getIndexConnection을 호출하면
    // 내부에서 apikey를 담아 indexName으로 글로벌 컨트롤 플레인 엔드포인트에 요청 전송
    // 응답으로 region/cloud가 포함된 Data-Plane 전용 엔드포인트를 받아와서 캐싱.
    @Bean
    public Index pineconeIndex(Pinecone pineconeClient) {
        return pineconeClient.getIndexConnection(indexName);
    }
}
