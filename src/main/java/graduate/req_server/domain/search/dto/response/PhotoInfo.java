package graduate.req_server.domain.search.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class PhotoInfo {

    private String url;
    private double size;
    private double score;
}
