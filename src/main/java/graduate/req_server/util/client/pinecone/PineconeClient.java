package graduate.req_server.util.client.pinecone;

import io.pinecone.clients.Index;
import io.pinecone.unsigned_indices_model.QueryResponseWithUnsignedIndices;
import io.pinecone.unsigned_indices_model.ScoredVectorWithUnsignedIndices;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PineconeClient {

    private final Index pineconeIndex;

    @Value("${pinecone.top-k}")
    private int topK;

    public List<ScoredVectorWithUnsignedIndices> queryTopKWithScore(List<Float> vector) {
        QueryResponseWithUnsignedIndices response = pineconeIndex.queryByVector(
                topK,
                vector
        );

        return Optional.ofNullable(response)
                .map(QueryResponseWithUnsignedIndices::getMatchesList)
                .orElse(Collections.emptyList());
    }

    public List<ScoredVectorWithUnsignedIndices> queryTopKWithUserId(List<Float> vector, String userId) {
        QueryResponseWithUnsignedIndices response = pineconeIndex.queryByVector(
                topK,
                vector,
                userId
        );

        return Optional.ofNullable(response)
                .map(QueryResponseWithUnsignedIndices::getMatchesList)
                .orElse(Collections.emptyList());
    }

    public void deleteVector(String id) {
        pineconeIndex.deleteByIds(List.of(id));
    }
}
