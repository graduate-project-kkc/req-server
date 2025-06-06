package graduate.req_server.domain.search.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SearchResponse {

    private List<String> imageUrls;
}
