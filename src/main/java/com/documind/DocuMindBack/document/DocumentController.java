package com.documind.DocuMindBack.document;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    private final DocumentIngestionService ingestionService;
    private final DocumentRepository documentRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            UUID documentId = ingestionService.ingestPdfDocument(file);
            return ResponseEntity.ok("ID: " + documentId.toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro: " + e.getMessage());
        }
    }

    @PostMapping("/details")
    public ResponseEntity<List<Document>> getDocumentDetails(@RequestBody List<UUID> documentIds) {
        return ResponseEntity.ok(documentRepository.findAllById(documentIds));
    }
}