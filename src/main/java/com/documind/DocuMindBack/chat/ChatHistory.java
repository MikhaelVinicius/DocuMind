package com.documind.DocuMindBack.chat;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "historico_chat")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sessao_id", nullable = false)
    private UUID sessaoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_mensagem", nullable = false)
    private MessageType tipoMensagem;

    @Column(name = "conteudo_mensagem", columnDefinition = "TEXT", nullable = false)
    private String conteudoMensagem;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    // Correção: Mapeamento relacional simples para listas no PostgreSQL
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "historico_chat_documentos", joinColumns = @JoinColumn(name = "chat_history_id"))
    @Column(name = "documento_id")
    private List<String> documentosReferenciados;

    public enum MessageType {
        USUARIO, IA
    }

    public ChatHistory(UUID sessaoId, MessageType tipoMensagem, String conteudoMensagem, List<String> documentosReferenciados) {
        this.sessaoId = sessaoId;
        this.tipoMensagem = tipoMensagem;
        this.conteudoMensagem = conteudoMensagem;
        this.documentosReferenciados = documentosReferenciados;
        this.dataHora = LocalDateTime.now();
    }
}