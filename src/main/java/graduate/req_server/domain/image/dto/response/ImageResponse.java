package graduate.req_server.domain.image.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class ImageResponse {
    private List<String> imageIds;
    private String status;
}
