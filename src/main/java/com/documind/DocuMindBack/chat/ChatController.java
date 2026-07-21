package com.documind.DocuMindBack.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ChatController {

    private final RagChatService ragChatService;

    @GetMapping("/{sessionId}")
    public ResponseEntity<List<ChatHistory>> getChatHistory(@PathVariable UUID sessionId) {
        List<ChatHistory> history = ragChatService.getChatHistoryForSession(sessionId);
        return ResponseEntity.ok(history);
    }

    // Correção: Mapeado como GET para funcionar com a API EventSource do navegador
    @GetMapping(value = "/{sessionId}/ask", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> askQuestion(@PathVariable UUID sessionId, @RequestParam String question) {
        log.info("Recebida pergunta para sessão {}: {}", sessionId, question);
        return ragChatService.chatWithRag(sessionId, question)
                .map(token -> ServerSentEvent.<String>builder()
                        .data(token)
                        .build())
                .doOnComplete(() -> log.info("Streaming de resposta concluído para sessão {}", sessionId))
                .doOnError(error -> log.error("Erro durante o streaming para sessão {}", sessionId, error));
    }

    @GetMapping("/new-session")
    public ResponseEntity<UUID> startNewSession() {
        UUID newSessionId = UUID.randomUUID();
        log.info("Nova sessão de chat iniciada: {}", newSessionId);
        return ResponseEntity.ok(newSessionId);
    }
}