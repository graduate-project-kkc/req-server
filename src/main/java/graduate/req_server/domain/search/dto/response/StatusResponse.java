package graduate.req_server.domain.search.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@AllArgsConstructor
@Getter
public class StatusResponse {

    private String fileSize;
    private int fileCount;
}
