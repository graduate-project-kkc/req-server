package graduate.req_server.util.file;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public class MultipartUtils {

    public static void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            //TODO Error
        }
    }

    public static String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}