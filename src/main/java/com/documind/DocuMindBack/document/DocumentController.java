package com.documind.DocuMindBack.document;



import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentIngestionService documentIngestionService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um arquivo.");
        }
        if (!"application/pdf".equals(file.getContentType())) {
            return ResponseEntity.badRequest().body("Apenas arquivos PDF são permitidos.");
        }
        try {
            UUID documentId = documentIngestionService.ingestPdfDocument(file);
            return ResponseEntity.status(HttpStatus.CREATED).body("Documento processado com sucesso. ID: " + documentId);
        } catch (IOException e) {
            log.error("Erro ao processar o documento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao processar o arquivo.");
        } catch (Exception e) {
            log.error("Erro inesperado ao processar o documento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro inesperado no servidor.");
        }
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentIngestionService.getAllDocuments();
        return ResponseEntity.ok(documents);
    }
}