package com.documind.DocuMindBack.document;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.DocumentParser;
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
        com.documind.DocuMindBack.document.Document docEntity = new com.documind.DocuMindBack.document.Document(
                multipartFile.getOriginalFilename(),
                multipartFile.getSize(),
                multipartFile.getContentType(),
                null
        );
        docEntity = documentRepository.save(docEntity);
        log.info("Documento salvo com ID: {}", docEntity.getId());

        InputStream inputStream = multipartFile.getInputStream();
        DocumentParser documentParser = new ApacheTikaDocumentParser();
        Document document = documentParser.parse(inputStream);

        DocumentSplitter splitter = recursive(500, 50);
        List<TextSegment> segments = splitter.split(document);

        int ordemNoDocumento = 0;
        for (TextSegment segment : segments) {
            // INJETANDO O ID NO METADADO PARA O RAG ENCONTRAR A FONTE
            segment.metadata().put("document_id", docEntity.getId().toString());

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
        return docEntity.getId();
    }
}