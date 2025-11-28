package graduate.req_server.util.client.ai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VectorizeRequest {
    private List<String> imageIds;
    private String userId;
}