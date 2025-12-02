package graduate.req_server.domain.image.controller;

import graduate.req_server.domain.image.dto.request.ImageRequest;
import graduate.req_server.domain.image.service.ImageService;
import graduate.req_server.util.client.ai.dto.UploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {

    private final ImageService imageService;

    @PostMapping
    public ResponseEntity<UploadResponse> uploadImage(@ModelAttribute ImageRequest request) {
        log.debug("[ImageController] uploadImage");

        UploadResponse responses = imageService.uploadAndProcess(request);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable String id) {
        log.debug("[ImageController] deleteImage");

        imageService.deleteImage(id);
        return ResponseEntity.ok().build();
    }
}
