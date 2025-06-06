package graduate.req_server.util.client.ai.dto;

import java.util.List;
import lombok.Getter;

@Getter
public class VectorResponse {
    private String status;
    private List<Float> vector;
}
