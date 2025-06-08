package graduate.req_server.domain.search.controller;

import graduate.req_server.domain.search.dto.request.SearchRequest;
import graduate.req_server.domain.search.dto.response.SearchResponse;
import graduate.req_server.domain.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResponse> search(@RequestParam String query) {
        log.debug("[SearchController] search");

        return ResponseEntity.ok(searchService.searchByText(new SearchRequest(query)));
    }
}
