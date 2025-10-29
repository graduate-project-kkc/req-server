package graduate.req_server.util.client.translate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.translate.TranslateClient;
import software.amazon.awssdk.services.translate.model.TranslateException;
import software.amazon.awssdk.services.translate.model.TranslateTextRequest;
import software.amazon.awssdk.services.translate.model.TranslateTextResponse;

@Slf4j
@Component
@RequiredArgsConstructor
public class TranslationService {
    private final TranslateClient translateClient;

    public String translate(String text, String sourceLanguageCode, String targetLanguageCode) {
        try {
            TranslateTextRequest request = TranslateTextRequest.builder()
                    .text(text)
                    .sourceLanguageCode(sourceLanguageCode)
                    .targetLanguageCode(targetLanguageCode)
                    .build();

            TranslateTextResponse response = translateClient.translateText(request);
            return response.translatedText();

        } catch (TranslateException e) {
            log.error("번역 오류: {}", e.getMessage());
            return text;
        }
    }
}
