package graduate.req_server.domain.search.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class PhotoInfo {

    private final String id;
    private final String url;
    private final double size;
    private final double score;
    private final String originalFilename;
    private final String takenDate;

    @Builder
    private PhotoInfo(String id, String url, double size, double score, String originalFilename, String takenDate) {
        this.id = id;
        this.url = url;
        this.size = size;
        this.score = score;
        this.originalFilename = originalFilename;
        this.takenDate = takenDate;
    }
}
