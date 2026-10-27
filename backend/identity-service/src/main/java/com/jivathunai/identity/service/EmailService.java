package com.jivathunai.identity.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) {
        sendEmail(toEmail, otpCode, "Password Reset Request", "We received a request to reset your password for your Jiva Thunai account.", "If you did not request a password reset, please ignore this email or contact support.");
    }

    public void sendRegistrationOtpEmail(String toEmail, String otpCode) {
        sendEmail(toEmail, otpCode, "Account Registration", "Thank you for starting your registration with Jiva Thunai.", "If you did not request to create an account, please ignore this email.");
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Welcome to Jiva Thunai!");
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
                            .content { color: #334155; line-height: 1.6; font-size: 15px; padding: 35px 40px; }
                            .message-heading { color: #059669; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
                            .divider { border: 0; border-top: 2px solid #059669; margin: 0; }
                            .footer { font-size: 12px; text-align: center; line-height: 1.6; padding: 25px 40px 35px 40px; background-color: #ffffff; }
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
                                <div class="message-heading">Welcome, %s!</div>
                                <p>We are thrilled to have you on board.</p>
                                <p>Your Aadhaar-verified account has been successfully created. You can now access all features of the Jiva Thunai platform, manage your pets' records securely, and participate in our trusted community.</p>
                                <p>If you have any questions, feel free to reach out to our support team.</p>
                                <p>Best regards,<br><strong>The Jiva Thunai Team</strong></p>
                            </div>
                            <hr class="divider">
                            <div class="footer">
                                <div class="copyright-text">
                                    &copy; 2026 Jiva Thunai Platform. All Rights Reserved.<br>
                                    PCA Act 1960 Legal Compliance Standard
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """.formatted(fullName);

            helper.setText(htmlContent, true);

            // Attach inline logo
            FileSystemResource res = new FileSystemResource(new File("d:/.Nishant/PetCareJT/jivathunailogo.png"));
            if (res.exists()) {
                helper.addInline("logoImage", res);
            } else {
                log.warn("Logo image not found at specified path, sending without inline logo.");
            }

            mailSender.send(message);
            log.info("Welcome Email successfully sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send Welcome email to {}", toEmail, e);
        }
    }

    public void sendInvitationEmail(String toEmail, String token, String orgName, String roleName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Invitation to join " + orgName + " on Jiva Thunai");
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
                            .content { color: #334155; line-height: 1.6; font-size: 15px; padding: 35px 40px; }
                            .message-heading { color: #059669; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
                            .divider { border: 0; border-top: 2px solid #059669; margin: 0; }
                            .footer { font-size: 12px; text-align: center; line-height: 1.6; padding: 25px 40px 35px 40px; background-color: #ffffff; }
                            .copyright-text { color: #94a3b8; font-size: 11px; }
                            .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <img src="cid:logoImage" alt="Jiva Thunai Logo" class="logo">
                                <span class="app-name">Jiva Thunai</span>
                            </div>
                            <div class="content">
                                <div class="message-heading">You've been invited!</div>
                                <p>You have been invited to join <strong>%s</strong> as a <strong>%s</strong> on the Jiva Thunai platform.</p>
                                <p>Please click the button below or use the access code to accept the invitation and set up your account:</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="http://localhost:5173/register?inviteToken=%s" class="button" style="color: #ffffff;">Accept Invitation</a>
                                </div>
                                <div style="margin-top: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #059669; padding: 20px; border-radius: 6px;">
                                    <p style="margin: 0; font-size: 14px; color: #334155;">Or use this access code directly during registration:</p>
                                    <p style="margin: 8px 0 0 0; font-size: 22px; font-weight: bold; color: #0f172a; letter-spacing: 2px;">%s</p>
                                </div>
                                <p style="margin-top: 25px;">If you have any questions, feel free to reach out to your administrator.</p>
                                <p>Best regards,<br><strong>The Jiva Thunai Team</strong></p>
                            </div>
                            <hr class="divider">
                            <div class="footer">
                                <div class="copyright-text">
                                    &copy; 2026 Jiva Thunai Platform. All Rights Reserved.<br>
                                    PCA Act 1960 Legal Compliance Standard
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """.formatted(orgName, roleName, token, token);

            helper.setText(htmlContent, true);

            FileSystemResource res = new FileSystemResource(new File("d:/.Nishant/PetCareJT/jivathunailogo.png"));
            if (res.exists()) {
                helper.addInline("logoImage", res);
            } else {
                log.warn("Logo image not found at specified path, sending without inline logo.");
            }

            mailSender.send(message);
            log.info("Invitation Email successfully sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send Invitation email to {}", toEmail, e);
        }
    }

    private void sendEmail(String toEmail, String otpCode, String subjectTitle, String introText, String footerText) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Jiva Thunai - " + subjectTitle + " OTP");
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
                            .otp-container { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #059669; padding: 20px 25px; margin: 30px 0; border-radius: 6px; }
                            .otp-box { color: #0f172a; font-size: 30px; font-weight: 700; letter-spacing: 6px; margin: 0; }
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
                                <div class="message-heading">%s</div>
                                <p>Hello,</p>
                                <p>%s</p>
                                <p>Your One-Time Password (OTP) is:</p>
                                <div class="otp-container">
                                    <div class="otp-box">%s</div>
                                </div>
                                <p><strong>Note:</strong> This OTP is strictly valid for <strong style="color:#dc2626;">10 minutes</strong>.</p>
                                <p>%s</p>
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
                    """.formatted(subjectTitle, introText, otpCode, footerText);

            helper.setText(htmlContent, true);

            // Attach inline logo
            FileSystemResource res = new FileSystemResource(new File("d:/.Nishant/PetCareJT/jivathunailogo.png"));
            if (res.exists()) {
                helper.addInline("logoImage", res);
            } else {
                log.warn("Logo image not found at specified path, sending without inline logo.");
            }

            mailSender.send(message);
            log.info("OTP Email successfully sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
        }
    }
}
