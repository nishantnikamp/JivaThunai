package com.jivathunai.payment.service;

import com.jivathunai.payment.entity.PaymentLedger;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    public void sendPaymentReceiptEmail(PaymentLedger payment) {
        if (payment.getCustomerEmail() == null || payment.getCustomerEmail().isEmpty()) {
            log.warn("No customer email provided for order {}. Skipping email receipt.", payment.getInternalOrderId());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(payment.getCustomerEmail());
            helper.setSubject("Payment Receipt - Jiva Thunai Order #" + payment.getInternalOrderId());
            helper.setFrom("noreply@jivathunai.com");

            String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 20px; }
                            .container { background-color: #ffffff; max-width: 550px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
                            .header { text-align: left; padding: 30px 40px 20px 40px; border-bottom: 2px solid #059669; }
                            .logo { max-height: 70px; width: auto; vertical-align: middle; margin-right: 12px; }
                            .app-name { font-size: 22px; font-weight: 800; color: #059669; vertical-align: middle; display: inline-block; letter-spacing: 0.5px; margin: 0; }
                            .message-heading { color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
                            .content { color: #334155; line-height: 1.6; font-size: 14px; padding: 35px 40px; }
                            .receipt-table { width: 100%%; border-collapse: collapse; margin: 30px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
                            .receipt-table th, .receipt-table td { padding: 15px 20px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                            .receipt-table th { background-color: #f8fafc; color: #475569; font-weight: 600; width: 40%%; }
                            .receipt-table td { background-color: #ffffff; color: #0f172a; font-weight: 700; }
                            .receipt-table tr:last-child th, .receipt-table tr:last-child td { border-bottom: none; }
                            .divider { border: 0; border-top: 2px solid #059669; margin: 0; }
                            .footer { font-size: 12px; text-align: center; line-height: 1.6; padding: 25px 40px 35px 40px; background-color: #ffffff; }
                            .automated-alert { color: #dc2626; font-style: normal; font-weight: 600; margin-bottom: 12px; }
                            .copyright-text { color: #94a3b8; font-size: 11px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <img src="cid:logoImage" alt="Jiva Thunai Logo" class="logo">
                                <span class="app-name">Jiva Thunai</span>
                            </div>
                            <div class="content">
                                <div class="message-heading">Payment Successful</div>
                                <p>Dear %s,</p>
                                <p>Thank you for your payment. Your transaction was processed successfully.</p>
                                <table class="receipt-table">
                                    <tr>
                                        <th>Internal Order ID</th>
                                        <td>%s</td>
                                    </tr>
                                    <tr>
                                        <th>Razorpay Order ID</th>
                                        <td>%s</td>
                                    </tr>
                                    <tr>
                                        <th>Razorpay Payment ID</th>
                                        <td>%s</td>
                                    </tr>
                                    <tr>
                                        <th>Customer Name</th>
                                        <td>%s</td>
                                    </tr>
                                    <tr>
                                        <th>Amount Paid</th>
                                        <td style="color: #059669; font-size: 18px;">₹ %s</td>
                                    </tr>
                                    <tr>
                                        <th>Payment Status</th>
                                        <td style="color: #059669;">%s</td>
                                    </tr>
                                    <tr>
                                        <th>Date of Payment</th>
                                        <td>%s</td>
                                    </tr>
                                </table>
                                <p>If you have any questions about this transaction, please contact our support team.</p>
                            </div>
                            <hr class="divider">
                            <div class="footer">
                                <div class="automated-alert">This is an automatically generated message, Please do not reply.</div>
                                
                                <div class="copyright-text">
                                    &copy; 2026 Jiva Thunai Platform. All Rights Reserved.<br>
                                    PCA Act 1960 Legal Compliance Standard
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """.formatted(
                    payment.getCustomerName() != null ? payment.getCustomerName() : "Customer",
                    payment.getInternalOrderId(),
                    payment.getRazorpayOrderId() != null ? payment.getRazorpayOrderId() : "N/A",
                    payment.getRazorpayPaymentId() != null ? payment.getRazorpayPaymentId() : "N/A",
                    payment.getCustomerName() != null ? payment.getCustomerName() : "Customer",
                    payment.getAmount(),
                    payment.getStatus() != null ? payment.getStatus().name() : "N/A",
                    (payment.getUpdatedAt() != null ? payment.getUpdatedAt() : (payment.getCreatedAt() != null ? payment.getCreatedAt() : java.time.LocalDateTime.now())).format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy - HH:mm:ss"))
            );
            
            helper.setText(htmlContent, true);

            // Attach inline logo
            org.springframework.core.io.FileSystemResource res = new org.springframework.core.io.FileSystemResource(new java.io.File("d:/.Nishant/PetCareJT/jivathunailogo.png"));
            if (res.exists()) {
                helper.addInline("logoImage", res);
            } else {
                log.warn("Logo image not found at specified path, sending without inline logo.");
            }

            mailSender.send(message);
            log.info("Payment receipt email sent to {}", payment.getCustomerEmail());
        } catch (Exception e) {
            log.error("Failed to send payment receipt email to {}", payment.getCustomerEmail(), e);
        }
    }
}
