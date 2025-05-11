package graduate.req_server.domain.image.dto.request;

import java.util.List;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Getter
public class ImageRequest {
    private List<MultipartFile> files;
}
