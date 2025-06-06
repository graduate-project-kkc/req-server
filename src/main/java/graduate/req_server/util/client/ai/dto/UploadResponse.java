package graduate.req_server.util.client.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record UploadResponse(
        @JsonProperty("status") StatusBlock status,
        @JsonProperty("results") List<ResultItem> results
) {
    public record StatusBlock(
            @JsonProperty("success") int success,
            @JsonProperty("failed") int failed
    ) {}

    public record ResultItem(
            @JsonProperty("image_id") String image_id,
            @JsonProperty("status") String status,
            @JsonProperty("error_msg") String error_msg
    ) {}
}
