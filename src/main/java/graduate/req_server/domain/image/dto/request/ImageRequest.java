package graduate.req_server.domain.image.dto.request;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class ImageRequest {
    private List<MultipartFile> files;
}
