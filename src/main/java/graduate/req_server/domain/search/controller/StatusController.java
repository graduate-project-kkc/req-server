package graduate.req_server.domain.search.controller;

import graduate.req_server.domain.search.dto.response.StatusResponse;
import graduate.req_server.domain.search.service.StatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
public class StatusController {

    private final StatusService statusService;

    @GetMapping
    public ResponseEntity<StatusResponse> search() {
        log.debug("[StatusController] search");
        return ResponseEntity.ok(statusService.getStats("images"));
    }
}
