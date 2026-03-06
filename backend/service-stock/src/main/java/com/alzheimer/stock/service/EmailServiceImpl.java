package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CommandeDTO;
import com.alzheimer.stock.dto.LigneCommandeDTO;
import com.alzheimer.stock.entite.EmailLog;
import com.alzheimer.stock.entite.StatutCommande;
import com.alzheimer.stock.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final EmailLogRepository emailLogRepository;

    @Value("${app.mail.admin-email:admin@pharmacare.tn}")
    private String adminEmail;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy 'à' HH:mm");
    private static final DateTimeFormatter DATE_SHORT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    // ─── 1. Confirmation de commande → client ──────────────────────

    @Override
    @Async
    public void envoyerConfirmationCommande(CommandeDTO commande) {
        if (commande.getEmailClient() == null || commande.getEmailClient().isBlank()) {
            log.info("Pas d'email client — skip confirmation pour {}", commande.getReference());
            return;
        }

        String subject = "Commande " + commande.getReference() + " confirmée — PharmaCare";
        String html = buildConfirmationHtml(commande);

        sauvegarderEmail(commande.getEmailClient(), subject, html, "CONFIRMATION", commande.getReference());
    }

    // ─── 2. Changement de statut → client ──────────────────────────

    @Override
    @Async
    public void envoyerChangementStatut(CommandeDTO commande, StatutCommande ancienStatut) {
        if (commande.getEmailClient() == null || commande.getEmailClient().isBlank()) {
            log.info("Pas d'email client — skip statut pour {}", commande.getReference());
            return;
        }

        String statutLabel = getStatutLabel(commande.getStatut());
        String subject = "Commande " + commande.getReference() + " — " + statutLabel + " — PharmaCare";
        String html = buildStatutChangeHtml(commande, ancienStatut);

        sauvegarderEmail(commande.getEmailClient(), subject, html, "STATUT_CHANGE", commande.getReference());
    }

    // ─── 3. Notification admin ─────────────────────────────────────

    @Override
    @Async
    public void envoyerNotificationAdmin(CommandeDTO commande) {
        String subject = "Nouvelle commande " + commande.getReference()
                + " — " + commande.getMontantTotal() + " TND";
        String html = buildAdminNotificationHtml(commande);

        sauvegarderEmail(adminEmail, subject, html, "ADMIN_NOTIFICATION", commande.getReference());
    }

    // ─── Sauvegarde en base ──────────────────────────────────────────

    private void sauvegarderEmail(String to, String subject, String html, String type, String referenceCommande) {
        try {
            EmailLog emailLog = EmailLog.builder()
                    .destinataire(to)
                    .sujet(subject)
                    .contenuHtml(html)
                    .type(type)
                    .referenceCommande(referenceCommande)
                    .lu(false)
                    .build();
            emailLogRepository.save(emailLog);
            log.info("Email sauvegardé en base — type: {}, destinataire: {}, commande: {}", type, to, referenceCommande);
        } catch (Exception e) {
            log.error("Erreur sauvegarde email — {}", e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  PREMIUM HTML TEMPLATES
    // ═══════════════════════════════════════════════════════════════

    // ─── CONFIRMATION ────────────────────────────────────────────

    private String buildConfirmationHtml(CommandeDTO cmd) {
        StringBuilder sb = new StringBuilder();
        sb.append(htmlHead());

        // Outer wrapper
        sb.append("<div style=\"background:linear-gradient(180deg,#eef2f7 0%,#dfe6ef 100%);padding:0;margin:0;width:100%;\">");
        sb.append("<div style=\"max-width:640px;margin:0 auto;padding:32px 16px;\">");

        // ── Logo / brand bar ──
        sb.append("<div style=\"text-align:center;margin-bottom:24px;\">");
        sb.append("<div style=\"display:inline-block;background:linear-gradient(135deg,#1a73e8 0%,#00897b 100%);width:52px;height:52px;border-radius:14px;line-height:52px;font-size:26px;color:#fff;text-align:center;\">&#9769;</div>");
        sb.append("<p style=\"margin:10px 0 0;font-size:15px;font-weight:700;color:#1a73e8;letter-spacing:0.5px;\">PHARMACARE</p>");
        sb.append("</div>");

        // ── Main card ──
        sb.append("<div style=\"background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.04);\">");

        // ── Hero header ──
        sb.append("<div style=\"background:linear-gradient(135deg,#0d47a1 0%,#1a73e8 30%,#00897b 70%,#00695c 100%);padding:44px 40px 40px;text-align:center;position:relative;\">");
        // Decorative circles (using border-based approach for email compatibility)
        sb.append("<div style=\"position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.06);\"></div>");
        sb.append("<div style=\"position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.04);\"></div>");
        // Success icon circle
        sb.append("<div style=\"display:inline-block;width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.18);line-height:72px;font-size:34px;margin-bottom:16px;\">&#10004;&#65039;</div>");
        sb.append("<h1 style=\"color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.3px;\">Commande Confirm&#233;e !</h1>");
        sb.append("<p style=\"color:rgba(255,255,255,0.80);margin:10px 0 0;font-size:15px;font-weight:400;\">Merci pour votre confiance, ")
                .append(escHtml(cmd.getNomClient())).append("</p>");
        sb.append("</div>");

        // ── Order reference ribbon ──
        sb.append("<div style=\"background:linear-gradient(90deg,#e8f0fe 0%,#e0f2f1 100%);padding:18px 40px;display:table;width:100%;box-sizing:border-box;border-bottom:1px solid #e0e4ea;\">");
        sb.append("<div style=\"display:table-cell;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:11px;color:#5f6368;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;\">R&#233;f&#233;rence de commande</span>");
        sb.append("</div>");
        sb.append("<div style=\"display:table-cell;text-align:right;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:18px;font-weight:800;color:#1a73e8;letter-spacing:0.5px;font-family:'Courier New',monospace;\">").append(escHtml(cmd.getReference())).append("</span>");
        sb.append("</div>");
        sb.append("</div>");

        // ── Body ──
        sb.append("<div style=\"padding:36px 40px 24px;\">");

        // Greeting
        sb.append("<p style=\"font-size:15px;color:#3c4043;margin:0 0 8px;line-height:1.6;\">Votre commande a &#233;t&#233; enregistr&#233;e avec succ&#232;s et est en cours de traitement.</p>");
        sb.append("<p style=\"font-size:13px;color:#80868b;margin:0 0 28px;line-height:1.5;\">Vous recevrez une notification &#224; chaque &#233;tape de la pr&#233;paration de votre commande.</p>");

        // ── Order progress tracker ──
        sb.append("<div style=\"margin-bottom:32px;\">");
        sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
        sb.append("<tr>");
        // Step 1 - Active
        sb.append("<td style=\"text-align:center;width:25%;padding:0;\">");
        sb.append("<div style=\"display:inline-block;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1a73e8,#1557b0);color:#fff;font-size:14px;font-weight:700;line-height:36px;text-align:center;\">1</div>");
        sb.append("<p style=\"margin:6px 0 0;font-size:10px;font-weight:600;color:#1a73e8;text-transform:uppercase;letter-spacing:0.5px;\">Confirm&#233;e</p>");
        sb.append("</td>");
        // Step 2
        sb.append("<td style=\"text-align:center;width:25%;padding:0;\">");
        sb.append("<div style=\"display:inline-block;width:36px;height:36px;border-radius:50%;background:#e8f0fe;color:#9aa0a6;font-size:14px;font-weight:700;line-height:36px;text-align:center;\">2</div>");
        sb.append("<p style=\"margin:6px 0 0;font-size:10px;font-weight:600;color:#9aa0a6;text-transform:uppercase;letter-spacing:0.5px;\">Pr&#233;paration</p>");
        sb.append("</td>");
        // Step 3
        sb.append("<td style=\"text-align:center;width:25%;padding:0;\">");
        sb.append("<div style=\"display:inline-block;width:36px;height:36px;border-radius:50%;background:#e8f0fe;color:#9aa0a6;font-size:14px;font-weight:700;line-height:36px;text-align:center;\">3</div>");
        sb.append("<p style=\"margin:6px 0 0;font-size:10px;font-weight:600;color:#9aa0a6;text-transform:uppercase;letter-spacing:0.5px;\">Exp&#233;di&#233;e</p>");
        sb.append("</td>");
        // Step 4
        sb.append("<td style=\"text-align:center;width:25%;padding:0;\">");
        sb.append("<div style=\"display:inline-block;width:36px;height:36px;border-radius:50%;background:#e8f0fe;color:#9aa0a6;font-size:14px;font-weight:700;line-height:36px;text-align:center;\">4</div>");
        sb.append("<p style=\"margin:6px 0 0;font-size:10px;font-weight:600;color:#9aa0a6;text-transform:uppercase;letter-spacing:0.5px;\">Livr&#233;e</p>");
        sb.append("</td>");
        sb.append("</tr>");
        sb.append("</table>");
        sb.append("</div>");

        // ── Section: Articles commandés ──
        sb.append("<div style=\"margin-bottom:28px;\">");
        sb.append("<h2 style=\"font-size:13px;font-weight:700;color:#3c4043;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;padding-bottom:10px;border-bottom:2px solid #1a73e8;\">Articles command&#233;s</h2>");

        // Product cards
        if (cmd.getLignes() != null) {
            for (int i = 0; i < cmd.getLignes().size(); i++) {
                LigneCommandeDTO ligne = cmd.getLignes().get(i);
                String bgRow = (i % 2 == 0) ? "#fafbfd" : "#ffffff";
                sb.append("<div style=\"background:").append(bgRow).append(";border-radius:12px;padding:16px 20px;margin-bottom:8px;display:table;width:100%;box-sizing:border-box;\">");

                // Left: product info
                sb.append("<div style=\"display:table-cell;vertical-align:middle;width:60%;\">");
                sb.append("<div style=\"display:inline-block;width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#e8f0fe,#e0f2f1);text-align:center;line-height:40px;font-size:18px;margin-right:14px;vertical-align:middle;\">&#128138;</div>");
                sb.append("<div style=\"display:inline-block;vertical-align:middle;\">");
                sb.append("<p style=\"margin:0;font-size:14px;font-weight:600;color:#202124;\">").append(escHtml(ligne.getNomProduit())).append("</p>");
                sb.append("<p style=\"margin:2px 0 0;font-size:12px;color:#80868b;\">Quantit&#233;: ").append(ligne.getQuantite()).append(" &times; ").append(ligne.getPrixUnitaire()).append(" TND</p>");
                sb.append("</div>");
                sb.append("</div>");

                // Right: subtotal
                sb.append("<div style=\"display:table-cell;vertical-align:middle;text-align:right;\">");
                sb.append("<span style=\"font-size:16px;font-weight:800;color:#202124;\">").append(ligne.getSousTotal()).append("</span>");
                sb.append("<span style=\"font-size:12px;color:#5f6368;\"> TND</span>");
                sb.append("</div>");

                sb.append("</div>");
            }
        }
        sb.append("</div>");

        // ── Total section ──
        sb.append("<div style=\"background:linear-gradient(135deg,#0d47a1 0%,#1a73e8 50%,#00897b 100%);border-radius:14px;padding:22px 28px;margin-bottom:28px;display:table;width:100%;box-sizing:border-box;\">");
        sb.append("<div style=\"display:table-cell;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:14px;color:rgba(255,255,255,0.8);font-weight:500;\">Total de la commande</span><br>");
        sb.append("<span style=\"font-size:11px;color:rgba(255,255,255,0.6);\">").append(cmd.getNombreArticles()).append(" article(s)</span>");
        sb.append("</div>");
        sb.append("<div style=\"display:table-cell;text-align:right;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;\">").append(cmd.getMontantTotal()).append("</span>");
        sb.append("<span style=\"font-size:14px;color:rgba(255,255,255,0.85);font-weight:600;\"> TND</span>");
        sb.append("</div>");
        sb.append("</div>");

        // ── Delivery info card ──
        sb.append("<div style=\"border:1.5px solid #e0f2f1;border-radius:14px;padding:20px 24px;margin-bottom:28px;background:#f8fffe;\">");
        sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
        sb.append("<tr><td style=\"vertical-align:top;width:42px;\">");
        sb.append("<div style=\"width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#e0f2f1,#b2dfdb);text-align:center;line-height:38px;font-size:18px;\">&#128666;</div>");
        sb.append("</td><td style=\"vertical-align:top;padding-left:14px;\">");
        sb.append("<p style=\"margin:0;font-size:13px;font-weight:700;color:#00695c;\">Adresse de livraison</p>");
        sb.append("<p style=\"margin:4px 0 0;font-size:13px;color:#5f6368;line-height:1.5;\">").append(escHtml(cmd.getAdresseLivraison())).append("</p>");
        sb.append("</td></tr></table>");
        sb.append("</div>");

        // ── Contact info card ──
        if (cmd.getTelephoneClient() != null && !cmd.getTelephoneClient().isBlank()) {
            sb.append("<div style=\"border:1.5px solid #e8f0fe;border-radius:14px;padding:20px 24px;margin-bottom:28px;background:#f8f9ff;\">");
            sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
            sb.append("<tr><td style=\"vertical-align:top;width:42px;\">");
            sb.append("<div style=\"width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#e8f0fe,#bbdefb);text-align:center;line-height:38px;font-size:18px;\">&#128222;</div>");
            sb.append("</td><td style=\"vertical-align:top;padding-left:14px;\">");
            sb.append("<p style=\"margin:0;font-size:13px;font-weight:700;color:#1557b0;\">Contact</p>");
            sb.append("<p style=\"margin:4px 0 0;font-size:13px;color:#5f6368;\">").append(escHtml(cmd.getTelephoneClient())).append("</p>");
            sb.append("</td></tr></table>");
            sb.append("</div>");
        }

        // ── Trust badges ──
        sb.append("<div style=\"border-top:1px solid #e8eaed;padding-top:24px;\">");
        sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
        sb.append("<tr>");
        sb.append("<td style=\"text-align:center;width:33%;padding:0 4px;vertical-align:top;\">");
        sb.append("<div style=\"font-size:22px;margin-bottom:6px;\">&#128274;</div>");
        sb.append("<p style=\"margin:0;font-size:10px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.5px;\">Paiement<br>s&#233;curis&#233;</p>");
        sb.append("</td>");
        sb.append("<td style=\"text-align:center;width:33%;padding:0 4px;vertical-align:top;\">");
        sb.append("<div style=\"font-size:22px;margin-bottom:6px;\">&#128230;</div>");
        sb.append("<p style=\"margin:0;font-size:10px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.5px;\">Livraison<br>rapide</p>");
        sb.append("</td>");
        sb.append("<td style=\"text-align:center;width:33%;padding:0 4px;vertical-align:top;\">");
        sb.append("<div style=\"font-size:22px;margin-bottom:6px;\">&#9989;</div>");
        sb.append("<p style=\"margin:0;font-size:10px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.5px;\">Qualit&#233;<br>certifi&#233;e</p>");
        sb.append("</td>");
        sb.append("</tr></table>");
        sb.append("</div>");

        sb.append("</div>"); // End body

        // ── Footer ──
        sb.append(htmlFooterPremium());

        sb.append("</div>"); // End main card
        sb.append("</div></div>"); // End wrapper
        return sb.toString();
    }

    // ─── STATUS CHANGE ───────────────────────────────────────────

    private String buildStatutChangeHtml(CommandeDTO cmd, StatutCommande ancienStatut) {
        StringBuilder sb = new StringBuilder();
        sb.append(htmlHead());

        // Outer wrapper
        sb.append("<div style=\"background:linear-gradient(180deg,#eef2f7 0%,#dfe6ef 100%);padding:0;margin:0;width:100%;\">");
        sb.append("<div style=\"max-width:640px;margin:0 auto;padding:32px 16px;\">");

        // ── Logo ──
        sb.append("<div style=\"text-align:center;margin-bottom:24px;\">");
        sb.append("<div style=\"display:inline-block;background:linear-gradient(135deg,#1a73e8 0%,#00897b 100%);width:52px;height:52px;border-radius:14px;line-height:52px;font-size:26px;color:#fff;text-align:center;\">&#9769;</div>");
        sb.append("<p style=\"margin:10px 0 0;font-size:15px;font-weight:700;color:#1a73e8;letter-spacing:0.5px;\">PHARMACARE</p>");
        sb.append("</div>");

        // ── Main card ──
        sb.append("<div style=\"background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.04);\">");

        // ── Hero header with status-specific gradient ──
        String headerGrad = getStatutColor(cmd.getStatut());
        String emoji = getStatutEmoji(cmd.getStatut());
        sb.append("<div style=\"background:").append(headerGrad).append(";padding:44px 40px 40px;text-align:center;position:relative;\">");
        sb.append("<div style=\"position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.06);\"></div>");
        // Status icon
        sb.append("<div style=\"display:inline-block;width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.18);line-height:72px;font-size:34px;margin-bottom:16px;\">").append(emoji).append("</div>");
        sb.append("<h1 style=\"color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.3px;\">").append(getStatutLabel(cmd.getStatut())).append("</h1>");
        sb.append("<p style=\"color:rgba(255,255,255,0.80);margin:10px 0 0;font-size:15px;font-weight:400;\">Commande ").append(escHtml(cmd.getReference())).append("</p>");
        sb.append("</div>");

        // ── Body ──
        sb.append("<div style=\"padding:36px 40px 24px;\">");

        // Greeting
        sb.append("<p style=\"font-size:15px;color:#3c4043;margin:0 0 20px;line-height:1.6;\">Bonjour <strong>").append(escHtml(cmd.getNomClient())).append("</strong>,</p>");
        sb.append("<p style=\"font-size:14px;color:#5f6368;margin:0 0 28px;line-height:1.6;\">Le statut de votre commande a &#233;t&#233; mis &#224; jour :</p>");

        // ── Status transition card ──
        sb.append("<div style=\"background:#fafbfd;border-radius:16px;padding:24px;margin-bottom:28px;text-align:center;border:1px solid #e8eaed;\">");
        // Old status
        sb.append("<div style=\"display:inline-block;vertical-align:middle;\">");
        sb.append("<div style=\"background:#fce8e6;padding:10px 20px;border-radius:12px;\">");
        sb.append("<span style=\"font-size:12px;color:#9aa0a6;text-decoration:line-through;font-weight:500;\">").append(getStatutLabel(ancienStatut)).append("</span>");
        sb.append("</div>");
        sb.append("</div>");
        // Arrow
        sb.append("<div style=\"display:inline-block;vertical-align:middle;margin:0 16px;\">");
        sb.append("<div style=\"width:48px;height:2px;background:linear-gradient(90deg,#dadce0,").append(getStatutTextColor(cmd.getStatut())).append(");display:inline-block;vertical-align:middle;\"></div>");
        sb.append("<span style=\"font-size:18px;vertical-align:middle;margin-left:4px;\">&#9654;</span>");
        sb.append("</div>");
        // New status
        sb.append("<div style=\"display:inline-block;vertical-align:middle;\">");
        sb.append("<div style=\"background:").append(getStatutBgLight(cmd.getStatut())).append(";padding:10px 20px;border-radius:12px;border:2px solid ").append(getStatutTextColor(cmd.getStatut())).append(";\">");
        sb.append("<span style=\"font-size:14px;color:").append(getStatutTextColor(cmd.getStatut())).append(";font-weight:800;\">").append(getStatutLabel(cmd.getStatut())).append("</span>");
        sb.append("</div>");
        sb.append("</div>");
        sb.append("</div>");

        // ── Visual progress tracker ──
        sb.append(buildProgressTracker(cmd.getStatut()));

        // ── Contextual message ──
        sb.append("<div style=\"background:").append(getStatutBgLight(cmd.getStatut())).append(";border-left:4px solid ").append(getStatutTextColor(cmd.getStatut())).append(";border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:28px;\">");
        sb.append("<p style=\"margin:0;font-size:14px;color:#3c4043;line-height:1.6;\">").append(getStatutMessage(cmd.getStatut())).append("</p>");
        sb.append("</div>");

        // ── Order summary mini card ──
        sb.append("<div style=\"background:#fafbfd;border-radius:14px;padding:20px 24px;border:1px solid #e8eaed;margin-bottom:28px;\">");
        sb.append("<h3 style=\"margin:0 0 14px;font-size:12px;font-weight:700;color:#5f6368;text-transform:uppercase;letter-spacing:1px;\">R&#233;capitulatif</h3>");
        sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
        sb.append("<tr><td style=\"padding:6px 0;font-size:13px;color:#5f6368;\">R&#233;f&#233;rence</td><td style=\"padding:6px 0;text-align:right;font-weight:700;color:#1a73e8;font-family:'Courier New',monospace;\">").append(escHtml(cmd.getReference())).append("</td></tr>");
        sb.append("<tr><td style=\"padding:6px 0;font-size:13px;color:#5f6368;\">Articles</td><td style=\"padding:6px 0;text-align:right;font-weight:600;color:#3c4043;\">").append(cmd.getNombreArticles()).append(" article(s)</td></tr>");
        sb.append("<tr><td style=\"padding:10px 0 0;font-size:13px;color:#5f6368;border-top:1px solid #e8eaed;\">Total</td><td style=\"padding:10px 0 0;text-align:right;font-weight:800;font-size:18px;color:#202124;border-top:1px solid #e8eaed;\">").append(cmd.getMontantTotal()).append(" TND</td></tr>");
        sb.append("</table>");
        sb.append("</div>");

        // ── Help section ──
        sb.append("<div style=\"text-align:center;padding-top:8px;\">");
        sb.append("<p style=\"margin:0;font-size:12px;color:#9aa0a6;\">Des questions ? Contactez-nous &#224;</p>");
        sb.append("<p style=\"margin:4px 0 0;\"><a href=\"mailto:support@pharmacare.tn\" style=\"color:#1a73e8;font-size:13px;font-weight:600;text-decoration:none;\">support@pharmacare.tn</a></p>");
        sb.append("</div>");

        sb.append("</div>"); // End body

        // ── Footer ──
        sb.append(htmlFooterPremium());

        sb.append("</div>"); // End main card
        sb.append("</div></div>"); // End wrapper
        return sb.toString();
    }

    // ─── ADMIN NOTIFICATION ──────────────────────────────────────

    private String buildAdminNotificationHtml(CommandeDTO cmd) {
        StringBuilder sb = new StringBuilder();
        sb.append(htmlHead());

        // Outer wrapper
        sb.append("<div style=\"background:linear-gradient(180deg,#eef2f7 0%,#dfe6ef 100%);padding:0;margin:0;width:100%;\">");
        sb.append("<div style=\"max-width:640px;margin:0 auto;padding:32px 16px;\">");

        // ── Logo ──
        sb.append("<div style=\"text-align:center;margin-bottom:24px;\">");
        sb.append("<div style=\"display:inline-block;background:linear-gradient(135deg,#d93025 0%,#e65100 100%);width:52px;height:52px;border-radius:14px;line-height:52px;font-size:26px;color:#fff;text-align:center;\">&#128276;</div>");
        sb.append("<p style=\"margin:10px 0 0;font-size:15px;font-weight:700;color:#d93025;letter-spacing:0.5px;\">PHARMACARE ADMIN</p>");
        sb.append("</div>");

        // ── Main card ──
        sb.append("<div style=\"background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.04);\">");

        // ── Urgent banner ──
        sb.append("<div style=\"background:linear-gradient(135deg,#b71c1c 0%,#d93025 30%,#e65100 70%,#ef6c00 100%);padding:44px 40px 40px;text-align:center;position:relative;\">");
        sb.append("<div style=\"position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.06);\"></div>");
        // Bell icon
        sb.append("<div style=\"display:inline-block;width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.18);line-height:72px;font-size:34px;margin-bottom:16px;\">&#127873;</div>");
        sb.append("<h1 style=\"color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.3px;\">Nouvelle Commande !</h1>");
        sb.append("<p style=\"color:rgba(255,255,255,0.80);margin:10px 0 0;font-size:15px;\">Action requise &#8212; Commande &#224; traiter</p>");
        sb.append("</div>");

        // ── Quick stats bar ──
        sb.append("<div style=\"background:linear-gradient(90deg,#fff5f5 0%,#fef7e0 100%);padding:16px 40px;border-bottom:1px solid #e8eaed;\">");
        sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
        sb.append("<tr>");
        sb.append("<td style=\"text-align:center;width:33%;padding:4px;\">");
        sb.append("<span style=\"font-size:20px;font-weight:900;color:#d93025;\">").append(cmd.getMontantTotal()).append("</span><br>");
        sb.append("<span style=\"font-size:10px;color:#80868b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;\">TND Total</span>");
        sb.append("</td>");
        sb.append("<td style=\"text-align:center;width:33%;padding:4px;border-left:1px solid #e8eaed;border-right:1px solid #e8eaed;\">");
        sb.append("<span style=\"font-size:20px;font-weight:900;color:#e65100;\">").append(cmd.getNombreArticles()).append("</span><br>");
        sb.append("<span style=\"font-size:10px;color:#80868b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;\">Articles</span>");
        sb.append("</td>");
        sb.append("<td style=\"text-align:center;width:33%;padding:4px;\">");
        sb.append("<span style=\"font-size:20px;font-weight:900;color:#ef6c00;\">&#9200;</span><br>");
        sb.append("<span style=\"font-size:10px;color:#80868b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;\">En attente</span>");
        sb.append("</td>");
        sb.append("</tr></table>");
        sb.append("</div>");

        // ── Body ──
        sb.append("<div style=\"padding:32px 40px 24px;\">");

        // ── Client profile card ──
        sb.append("<div style=\"background:#fafbfd;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid #e8eaed;\">");
        sb.append("<h3 style=\"margin:0 0 16px;font-size:12px;font-weight:700;color:#5f6368;text-transform:uppercase;letter-spacing:1px;\">&#128100; Informations Client</h3>");
        sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
        // Name
        sb.append("<tr>");
        sb.append("<td style=\"padding:8px 0;vertical-align:middle;width:36px;\">");
        sb.append("<div style=\"width:30px;height:30px;border-radius:8px;background:#e8f0fe;text-align:center;line-height:30px;font-size:13px;\">&#128100;</div>");
        sb.append("</td>");
        sb.append("<td style=\"padding:8px 0 8px 12px;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:11px;color:#9aa0a6;display:block;\">Nom complet</span>");
        sb.append("<span style=\"font-size:14px;font-weight:700;color:#202124;\">").append(escHtml(cmd.getNomClient())).append("</span>");
        sb.append("</td></tr>");
        // Email
        sb.append("<tr>");
        sb.append("<td style=\"padding:8px 0;vertical-align:middle;\">");
        sb.append("<div style=\"width:30px;height:30px;border-radius:8px;background:#e8f0fe;text-align:center;line-height:30px;font-size:13px;\">&#9993;</div>");
        sb.append("</td>");
        sb.append("<td style=\"padding:8px 0 8px 12px;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:11px;color:#9aa0a6;display:block;\">Email</span>");
        sb.append("<a href=\"mailto:").append(escHtml(cmd.getEmailClient())).append("\" style=\"font-size:14px;font-weight:600;color:#1a73e8;text-decoration:none;\">").append(escHtml(cmd.getEmailClient())).append("</a>");
        sb.append("</td></tr>");
        // Phone
        sb.append("<tr>");
        sb.append("<td style=\"padding:8px 0;vertical-align:middle;\">");
        sb.append("<div style=\"width:30px;height:30px;border-radius:8px;background:#e8f0fe;text-align:center;line-height:30px;font-size:13px;\">&#128222;</div>");
        sb.append("</td>");
        sb.append("<td style=\"padding:8px 0 8px 12px;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:11px;color:#9aa0a6;display:block;\">T&#233;l&#233;phone</span>");
        sb.append("<span style=\"font-size:14px;font-weight:600;color:#202124;\">").append(escHtml(cmd.getTelephoneClient())).append("</span>");
        sb.append("</td></tr>");
        // Address
        sb.append("<tr>");
        sb.append("<td style=\"padding:8px 0;vertical-align:middle;\">");
        sb.append("<div style=\"width:30px;height:30px;border-radius:8px;background:#e8f0fe;text-align:center;line-height:30px;font-size:13px;\">&#128205;</div>");
        sb.append("</td>");
        sb.append("<td style=\"padding:8px 0 8px 12px;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:11px;color:#9aa0a6;display:block;\">Adresse livraison</span>");
        sb.append("<span style=\"font-size:14px;font-weight:600;color:#202124;\">").append(escHtml(cmd.getAdresseLivraison())).append("</span>");
        sb.append("</td></tr>");
        // Date
        if (cmd.getDateCommande() != null) {
            sb.append("<tr>");
            sb.append("<td style=\"padding:8px 0;vertical-align:middle;\">");
            sb.append("<div style=\"width:30px;height:30px;border-radius:8px;background:#e8f0fe;text-align:center;line-height:30px;font-size:13px;\">&#128197;</div>");
            sb.append("</td>");
            sb.append("<td style=\"padding:8px 0 8px 12px;vertical-align:middle;\">");
            sb.append("<span style=\"font-size:11px;color:#9aa0a6;display:block;\">Date de commande</span>");
            sb.append("<span style=\"font-size:14px;font-weight:600;color:#202124;\">").append(cmd.getDateCommande().format(DATE_FMT)).append("</span>");
            sb.append("</td></tr>");
        }
        sb.append("</table>");
        sb.append("</div>");

        // ── Products section ──
        sb.append("<div style=\"margin-bottom:24px;\">");
        sb.append("<h3 style=\"margin:0 0 16px;font-size:12px;font-weight:700;color:#5f6368;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;border-bottom:2px solid #d93025;\">&#128230; D&#233;tail des articles</h3>");

        if (cmd.getLignes() != null) {
            for (int i = 0; i < cmd.getLignes().size(); i++) {
                LigneCommandeDTO ligne = cmd.getLignes().get(i);
                String bgRow = (i % 2 == 0) ? "#fafbfd" : "#ffffff";
                sb.append("<div style=\"background:").append(bgRow).append(";border-radius:12px;padding:14px 18px;margin-bottom:6px;display:table;width:100%;box-sizing:border-box;\">");
                sb.append("<div style=\"display:table-cell;vertical-align:middle;width:65%;\">");
                sb.append("<p style=\"margin:0;font-size:14px;font-weight:600;color:#202124;\">").append(escHtml(ligne.getNomProduit())).append("</p>");
                sb.append("<p style=\"margin:2px 0 0;font-size:12px;color:#80868b;\">").append(ligne.getQuantite()).append(" &times; ").append(ligne.getPrixUnitaire()).append(" TND</p>");
                sb.append("</div>");
                sb.append("<div style=\"display:table-cell;vertical-align:middle;text-align:right;\">");
                sb.append("<span style=\"font-size:15px;font-weight:800;color:#d93025;\">").append(ligne.getSousTotal()).append(" TND</span>");
                sb.append("</div>");
                sb.append("</div>");
            }
        }
        sb.append("</div>");

        // ── Grand total ──
        sb.append("<div style=\"background:linear-gradient(135deg,#b71c1c 0%,#d93025 50%,#e65100 100%);border-radius:14px;padding:22px 28px;margin-bottom:24px;display:table;width:100%;box-sizing:border-box;\">");
        sb.append("<div style=\"display:table-cell;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:14px;color:rgba(255,255,255,0.8);font-weight:500;\">Total &#224; encaisser</span><br>");
        sb.append("<span style=\"font-size:11px;color:rgba(255,255,255,0.6);\">R&#233;f: ").append(escHtml(cmd.getReference())).append("</span>");
        sb.append("</div>");
        sb.append("<div style=\"display:table-cell;text-align:right;vertical-align:middle;\">");
        sb.append("<span style=\"font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;\">").append(cmd.getMontantTotal()).append("</span>");
        sb.append("<span style=\"font-size:14px;color:rgba(255,255,255,0.85);font-weight:600;\"> TND</span>");
        sb.append("</div>");
        sb.append("</div>");

        // ── Action reminder ──
        sb.append("<div style=\"background:#fef7e0;border-left:4px solid #f9ab00;border-radius:0 14px 14px 0;padding:16px 20px;margin-bottom:20px;\">");
        sb.append("<p style=\"margin:0;font-size:13px;color:#7a6200;line-height:1.6;\"><strong>&#9888; Rappel :</strong> Veuillez traiter cette commande dans les plus brefs d&#233;lais et mettre &#224; jour son statut dans le tableau de bord admin.</p>");
        sb.append("</div>");

        sb.append("</div>"); // End body

        // ── Footer ──
        sb.append(htmlFooterPremium());

        sb.append("</div>"); // End main card
        sb.append("</div></div>"); // End wrapper
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════
    //  SHARED TEMPLATE PARTS
    // ═══════════════════════════════════════════════════════════════

    private String htmlHead() {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">"
                + "<style>"
                + "body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}"
                + "table{border-spacing:0;}"
                + "td{padding:0;}"
                + "img{border:0;line-height:100%;outline:none;text-decoration:none;}"
                + "</style>"
                + "</head>"
                + "<body style=\"margin:0;padding:0;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif;background:#eef2f7;\">";
    }

    private String htmlFooterPremium() {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"padding:28px 40px 24px;background:#f8f9fa;\">");

        // Divider
        sb.append("<div style=\"height:1px;background:linear-gradient(90deg,transparent,#dadce0,transparent);margin-bottom:24px;\"></div>");

        // Brand
        sb.append("<div style=\"text-align:center;\">");
        sb.append("<p style=\"margin:0;font-size:16px;font-weight:800;color:#3c4043;letter-spacing:0.3px;\">Pharma<span style=\"color:#1a73e8;\">Care</span></p>");
        sb.append("<p style=\"margin:6px 0 0;font-size:11px;color:#9aa0a6;line-height:1.5;\">Votre pharmacie en ligne de confiance</p>");
        sb.append("<p style=\"margin:4px 0 0;font-size:11px;color:#9aa0a6;\">Tunis, Tunisie</p>");
        sb.append("</div>");

        // Social icons row
        sb.append("<div style=\"text-align:center;margin-top:18px;\">");
        sb.append("<span style=\"display:inline-block;width:32px;height:32px;border-radius:50%;background:#e8f0fe;text-align:center;line-height:32px;font-size:14px;margin:0 4px;color:#1a73e8;\">f</span>");
        sb.append("<span style=\"display:inline-block;width:32px;height:32px;border-radius:50%;background:#e8f0fe;text-align:center;line-height:32px;font-size:14px;margin:0 4px;color:#1a73e8;\">&#120143;</span>");
        sb.append("<span style=\"display:inline-block;width:32px;height:32px;border-radius:50%;background:#e8f0fe;text-align:center;line-height:32px;font-size:14px;margin:0 4px;color:#1a73e8;\">in</span>");
        sb.append("</div>");

        // Legal
        sb.append("<div style=\"text-align:center;margin-top:18px;\">");
        sb.append("<p style=\"margin:0;font-size:10px;color:#bdc1c6;line-height:1.6;\">Cet email a &#233;t&#233; g&#233;n&#233;r&#233; automatiquement par PharmaCare.<br>");
        sb.append("&#169; 2026 PharmaCare. Tous droits r&#233;serv&#233;s.</p>");
        sb.append("</div>");

        sb.append("</div>");
        return sb.toString();
    }

    // ─── Progress tracker (for status change email) ──────────────

    private String buildProgressTracker(StatutCommande currentStatut) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"margin-bottom:28px;padding:20px 0;\">");
        sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
        sb.append("<tr>");

        StatutCommande[] steps = { StatutCommande.EN_ATTENTE, StatutCommande.CONFIRMEE, StatutCommande.EN_PREPARATION, StatutCommande.EXPEDIEE, StatutCommande.LIVREE };
        int currentIdx = -1;
        for (int i = 0; i < steps.length; i++) {
            if (steps[i] == currentStatut) { currentIdx = i; break; }
        }
        // If ANNULEE, highlight nothing beyond step 0
        if (currentStatut == StatutCommande.ANNULEE) currentIdx = -1;

        for (int i = 0; i < steps.length; i++) {
            boolean done = (i < currentIdx);
            boolean active = (i == currentIdx);
            String bgColor = done ? "#1e8e3e" : active ? getStatutTextColor(currentStatut) : "#e8eaed";
            String textColor = (done || active) ? "#ffffff" : "#bdc1c6";
            String labelColor = active ? getStatutTextColor(currentStatut) : done ? "#1e8e3e" : "#9aa0a6";
            String icon = done ? "&#10003;" : String.valueOf(i + 1);

            sb.append("<td style=\"text-align:center;width:20%;padding:0 2px;\">");
            sb.append("<div style=\"display:inline-block;width:32px;height:32px;border-radius:50%;background:").append(bgColor).append(";color:").append(textColor).append(";font-size:12px;font-weight:700;line-height:32px;text-align:center;");
            if (active) sb.append("box-shadow:0 0 0 4px ").append(getStatutBgLight(currentStatut)).append(";");
            sb.append("\">").append(icon).append("</div>");
            sb.append("<p style=\"margin:5px 0 0;font-size:9px;font-weight:600;color:").append(labelColor).append(";text-transform:uppercase;letter-spacing:0.3px;\">").append(getStatutLabelShort(steps[i])).append("</p>");
            sb.append("</td>");
        }

        sb.append("</tr></table>");

        // If cancelled, show red banner
        if (currentStatut == StatutCommande.ANNULEE) {
            sb.append("<div style=\"background:#fce8e6;border-radius:10px;padding:10px 16px;margin-top:12px;text-align:center;\">");
            sb.append("<span style=\"font-size:12px;font-weight:700;color:#d93025;\">&#10060; Commande annul&#233;e</span>");
            sb.append("</div>");
        }

        sb.append("</div>");
        return sb.toString();
    }

    // ─── Status helpers ────────────────────────────────────────────

    private String getStatutLabel(StatutCommande statut) {
        return switch (statut) {
            case EN_ATTENTE -> "En attente";
            case CONFIRMEE -> "Confirm\u00e9e";
            case EN_PREPARATION -> "En pr\u00e9paration";
            case EXPEDIEE -> "Exp\u00e9di\u00e9e";
            case LIVREE -> "Livr\u00e9e";
            case ANNULEE -> "Annul\u00e9e";
        };
    }

    private String getStatutLabelShort(StatutCommande statut) {
        return switch (statut) {
            case EN_ATTENTE -> "Attente";
            case CONFIRMEE -> "Confirm.";
            case EN_PREPARATION -> "Pr&#233;par.";
            case EXPEDIEE -> "Envoy.";
            case LIVREE -> "Livr&#233;e";
            case ANNULEE -> "Annul.";
        };
    }

    private String getStatutEmoji(StatutCommande statut) {
        return switch (statut) {
            case EN_ATTENTE -> "&#9203;";
            case CONFIRMEE -> "&#10004;&#65039;";
            case EN_PREPARATION -> "&#128230;";
            case EXPEDIEE -> "&#128666;";
            case LIVREE -> "&#127881;";
            case ANNULEE -> "&#10060;";
        };
    }

    private String getStatutColor(StatutCommande statut) {
        return switch (statut) {
            case EN_ATTENTE -> "linear-gradient(135deg,#e65100 0%,#f9ab00 100%)";
            case CONFIRMEE -> "linear-gradient(135deg,#0d47a1 0%,#1a73e8 50%,#00897b 100%)";
            case EN_PREPARATION -> "linear-gradient(135deg,#0d47a1 0%,#1557b0 100%)";
            case EXPEDIEE -> "linear-gradient(135deg,#00695c 0%,#00897b 50%,#1e8e3e 100%)";
            case LIVREE -> "linear-gradient(135deg,#1b5e20 0%,#1e8e3e 50%,#00897b 100%)";
            case ANNULEE -> "linear-gradient(135deg,#b71c1c 0%,#d93025 50%,#e65100 100%)";
        };
    }

    private String getStatutBgLight(StatutCommande statut) {
        return switch (statut) {
            case EN_ATTENTE -> "#fef7e0";
            case CONFIRMEE -> "#e8f0fe";
            case EN_PREPARATION -> "#e8f0fe";
            case EXPEDIEE -> "#e0f2f1";
            case LIVREE -> "#e6f4ea";
            case ANNULEE -> "#fce8e6";
        };
    }

    private String getStatutTextColor(StatutCommande statut) {
        return switch (statut) {
            case EN_ATTENTE -> "#e65100";
            case CONFIRMEE -> "#1a73e8";
            case EN_PREPARATION -> "#1557b0";
            case EXPEDIEE -> "#00897b";
            case LIVREE -> "#1e8e3e";
            case ANNULEE -> "#d93025";
        };
    }

    private String getStatutMessage(StatutCommande statut) {
        return switch (statut) {
            case EN_ATTENTE -> "Votre commande est en cours de v&#233;rification par notre &#233;quipe. Nous vous tiendrons inform&#233;(e) de chaque &#233;tape.";
            case CONFIRMEE -> "Excellente nouvelle ! Votre commande a &#233;t&#233; valid&#233;e et sera bient&#244;t pr&#233;par&#233;e pour l'exp&#233;dition. Tout est en ordre.";
            case EN_PREPARATION -> "Nos &#233;quipes pr&#233;parent votre colis avec le plus grand soin. L'exp&#233;dition est imminente, restez connect&#233;(e) !";
            case EXPEDIEE -> "&#127881; Votre colis est en route ! Vous le recevrez dans les prochaines <strong>24 &#224; 48 heures</strong>. Tenez-vous pr&#234;t(e) !";
            case LIVREE -> "Votre commande a &#233;t&#233; livr&#233;e avec succ&#232;s ! Nous esp&#233;rons que tout vous convient. Merci pour votre confiance.";
            case ANNULEE -> "Votre commande a &#233;t&#233; annul&#233;e. Si un remboursement est applicable, il sera trait&#233; sous 5 jours ouvr&#233;s.";
        };
    }

    private String escHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
