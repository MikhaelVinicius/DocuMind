package com.documind.DocuMindBack.chat;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.V;
import dev.langchain4j.store.memory.chat.ChatMemory;
import dev.langchain4j.store.memory.chat.MessageWindowChatMemory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RagChatService {

    private final StreamingChatLanguageModel streamingChatLanguageModel;
    private final ContentRetriever contentRetriever;
    private final ChatHistoryRepository chatHistoryRepository;
    private final ChatMemory chatMemory = MessageWindowChatMemory.withMaxMessages(10);
    private final DocuMindAiService aiService;

    interface DocuMindAiService {
        @SystemMessage(
            "Você é um assistente de IA corporativo chamado DocuMind. " +
            "Sua tarefa é responder a perguntas estritamente com base nas informações fornecidas no contexto. " +
            "Se a resposta não puder ser encontrada no contexto, diga 'Não consigo encontrar informações relevantes para esta pergunta.' " +
            "Não invente informações. Mantenha as respostas concisas e diretas. " +
            "Contexto: {context}"
        )
        Flux<String> chat(@UserMessage String userMessage, @MemoryId UUID sessionId, @V("context") String context);
    }

    public RagChatService(StreamingChatLanguageModel streamingChatLanguageModel,
                          ContentRetriever contentRetriever,
                          ChatHistoryRepository chatHistoryRepository) {
        this.streamingChatLanguageModel = streamingChatLanguageModel;
        this.contentRetriever = contentRetriever;
        this.chatHistoryRepository = chatHistoryRepository;
        this.aiService = AiServices.builder(DocuMindAiService.class)
                .streamingChatLanguageModel(streamingChatLanguageModel)
                .contentRetriever(contentRetriever)
                .chatMemory(chatMemory)
                .build();
    }

    public Flux<String> chatWithRag(UUID sessionId, String userQuestion) {
        List<TextSegment> relevantSegments = contentRetriever.retrieve(dev.langchain4j.rag.query.Query.from(userQuestion)).stream()
                .map(content -> TextSegment.from(content.text(), content.metadata()))
                .collect(Collectors.toList());

        String context = relevantSegments.stream()
                .map(TextSegment::text)
                .collect(Collectors.joining("\n\n"));

        if (context.isEmpty()) {
            chatHistoryRepository.save(new ChatHistory(sessionId, ChatHistory.MessageType.USUARIO, userQuestion, null));
            String noContextResponse = "Não consigo encontrar informações relevantes para esta pergunta.";
            chatHistoryRepository.save(new ChatHistory(sessionId, ChatHistory.MessageType.IA, noContextResponse, null));
            return Flux.just(noContextResponse);
        }

        chatHistoryRepository.save(new ChatHistory(sessionId, ChatHistory.MessageType.USUARIO, userQuestion, null));

        StringBuilder aiResponseBuilder = new StringBuilder();
        String[] referencedDocumentIds = relevantSegments.stream()
                .map(segment -> segment.metadata().get("document_id"))
                .filter(java.util.Objects::nonNull)
                .map(Object::toString)
                .distinct()
                .toArray(String[]::new);

        return aiService.chat(userQuestion, sessionId, context)
                .doOnNext(aiResponseBuilder::append)
                .doOnComplete(() -> chatHistoryRepository.save(new ChatHistory(
                        sessionId, 
                        ChatHistory.MessageType.IA, 
                        aiResponseBuilder.toString(), 
                        referencedDocumentIds
                )));
    }

    public List<ChatHistory> getChatHistoryForSession(UUID sessionId) {
        return chatHistoryRepository.findBySessaoIdOrderByDataHoraAsc(sessionId);
    }
}