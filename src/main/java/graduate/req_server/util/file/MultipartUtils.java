package graduate.req_server.util.file;

import graduate.req_server.common.exception.CustomException;
import graduate.req_server.common.exception.ErrorCode;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public class MultipartUtils {

    private MultipartUtils() {}

    public static void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty() || files.stream().anyMatch(MultipartFile::isEmpty)) {
            throw new CustomException(ErrorCode.EMPTY_FILE);
        }
    }
}