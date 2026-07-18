package com.documind.DocuMindBack.document;


import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.InputStreamDocumentLoader;
import dev.langchain4j.data.document.parser.apache.tika.ApacheTikaDocumentParser;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import static dev.langchain4j.data.document.splitter.DocumentSplitters.recursive;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentIngestionService {

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    @Transactional
    public UUID ingestPdfDocument(MultipartFile multipartFile) throws IOException {
        com.documind.documindbackend.document.Document docEntity = new com.documind.documindbackend.document.Document(
                multipartFile.getOriginalFilename(),
                multipartFile.getSize(),
                multipartFile.getContentType(),
                null
        );
        docEntity = documentRepository.save(docEntity);
        log.info("Documento salvo com ID: {}", docEntity.getId());

        InputStream inputStream = multipartFile.getInputStream();
        Document document = InputStreamDocumentLoader.builder()
                .inputStream(inputStream)
                .documentParser(new ApacheTikaDocumentParser())
                .build()
                .load();
        log.info("Documento carregado e parseado. Tamanho do texto: {} caracteres", document.text().length());

        DocumentSplitter splitter = recursive(500, 50);
        List<TextSegment> segments = splitter.split(document);
        log.info("Documento dividido em {} segmentos.", segments.size());

        int ordemNoDocumento = 0;
        for (TextSegment segment : segments) {
            dev.langchain4j.data.embedding.Embedding embedding = embeddingModel.embed(segment).content();
            embeddingStore.add(embedding, segment);

            DocumentChunk chunkEntity = new DocumentChunk(
                    docEntity,
                    segment.text(),
                    null,
                    ordemNoDocumento++
            );
            documentChunkRepository.save(chunkEntity);
        }
        log.info("Embeddings gerados e chunks persistidos para o documento ID: {}", docEntity.getId());
        return docEntity.getId();
    }
}