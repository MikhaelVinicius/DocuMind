package com.documind.DocuMindBack.document;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "data_upload", nullable = false)
    private LocalDateTime dataUpload;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "url_armazenamento")
    private String urlArmazenamento;

    public Document(String nome, Long tamanhoBytes, String mimeType, String urlArmazenamento) {
        this.nome = nome;
        this.tamanhoBytes = tamanhoBytes;
        this.mimeType = mimeType;
        this.urlArmazenamento = urlArmazenamento;
        this.dataUpload = LocalDateTime.now();
    }
}
