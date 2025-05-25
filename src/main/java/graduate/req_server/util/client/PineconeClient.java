package graduate.req_server.util.client;

import io.pinecone.clients.Index;
import io.pinecone.unsigned_indices_model.QueryResponseWithUnsignedIndices;
import io.pinecone.unsigned_indices_model.ScoredVectorWithUnsignedIndices;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PineconeClient {

    private final Index pineconeIndex;

    @Value("${pinecone.top-k}")
    private int topK;

    public List<String> queryTopK(List<Float> vector) {

        QueryResponseWithUnsignedIndices response = pineconeIndex.query(
                topK,
                vector,
                Collections.emptyList(),
                Collections.emptyList(),
                null,
                "",
                null,
                false,
                false
        );
        if(response==null || response.getMatchesList().isEmpty()) {
            return Collections.emptyList();
        }

        return response.getMatchesList().stream()
                .map(ScoredVectorWithUnsignedIndices::getId)
                .collect(Collectors.toList());
    }
}
