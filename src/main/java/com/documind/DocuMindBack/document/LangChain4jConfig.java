package com.documind.DocuMindBack.document;


import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.time.Duration;

@Configuration
public class LangChain4jConfig {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.embedding-model.name}")
    private String embeddingModelName;

    @Value("${openai.chat-model.name}")
    private String chatModelName;

    @Value("${openai.timeout}")
    private Duration openaiTimeout;

    @Value("${langchain4j.vector-store.pgvector.host}")
    private String pgvectorHost;

    @Value("${langchain4j.vector-store.pgvector.port}")
    private Integer pgvectorPort;

    @Value("${langchain4j.vector-store.pgvector.database}")
    private String pgvectorDatabase;

    @Value("${langchain4j.vector-store.pgvector.user}")
    private String pgvectorUser;

    @Value("${langchain4j.vector-store.pgvector.password}")
    private String pgvectorPassword;

    @Value("${langchain4j.vector-store.pgvector.table-name}")
    private String pgvectorTableName;

    @Value("${langchain4j.vector-store.pgvector.dimension}")
    private Integer pgvectorDimension;

    @Value("${langchain4j.vector-store.pgvector.create-table}")
    private Boolean pgvectorCreateTable;

    @Bean
    public EmbeddingModel embeddingModel() {
        return OpenAiEmbeddingModel.builder()
                .apiKey(openaiApiKey)
                .modelName(embeddingModelName)
                .logRequests(true)
                .logResponses(true)
                .timeout(openaiTimeout)
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore(DataSource dataSource) {
        return PgVectorEmbeddingStore.builder()
                .dataSource(dataSource)
                .host(pgvectorHost)
                .port(pgvectorPort)
                .database(pgvectorDatabase)
                .user(pgvectorUser)
                .password(pgvectorPassword)
                .table(pgvectorTableName)
                .dimension(pgvectorDimension)
                .createTable(pgvectorCreateTable)
                .build();
    }

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .apiKey(openaiApiKey)
                .modelName(chatModelName)
                .temperature(0.7)
                .timeout(openaiTimeout)
                .logRequests(true)
                .logResponses(true)
                .build();
    }

    @Bean
    public ContentRetriever contentRetriever(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        return EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(5)
                .minScore(0.7)
                .build();
    }
}