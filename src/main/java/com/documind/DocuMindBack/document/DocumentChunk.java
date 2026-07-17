package com.documind.DocuMindBack.document;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "document_chunk")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_id", nullable = false, foreignKey = @ForeignKey(name = "fk_document_chunk_documento"))
    private Document document;

    @Column(name = "conteudo_texto", columnDefinition = "TEXT", nullable = false)
    private String conteudoTexto;

    @Column(name = "numero_pagina")
    private Integer numeroPagina;

    @Column(name = "ordem_no_documento", nullable = false)
    private Integer ordemNoDocumento;

    public DocumentChunk(Document document, String conteudoTexto, Integer numeroPagina, Integer ordemNoDocumento) {
        this.document = document;
        this.conteudoTexto = conteudoTexto;
        this.numeroPagina = numeroPagina;
        this.ordemNoDocumento = ordemNoDocumento;
    }
}