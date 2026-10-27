package com.jivathunai.payment.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.jivathunai.payment.entity.PaymentLedger;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class ReceiptGeneratorService {

    public byte[] generateReceiptPdf(PaymentLedger payment) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // Colors (Emerald theme to match Jiva Thunai)
            Color primaryColor = new Color(16, 185, 129); // Emerald 500
            Color darkColor = new Color(15, 23, 42); // Slate 900
            Color lightBgColor = new Color(241, 245, 249); // Slate 100
            Color grayText = new Color(100, 116, 139); // Slate 500

            // Font configurations
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, primaryColor);
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, darkColor);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, darkColor);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, darkColor);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 10, grayText);

            // Header Table (Logo + Title)
            PdfPTable headerTable = new PdfPTable(3);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1f, 2f, 1f});
            headerTable.setSpacingAfter(30f);

            // 1. Left Cell (Logo)
            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            try {
                File logoFile = new File("d:/.Nishant/PetCareJT/jivathunailogo.png");
                if (logoFile.exists()) {
                    Image logo = Image.getInstance(logoFile.getAbsolutePath());
                    logo.scaleToFit(80, 80);
                    logo.setAlignment(Element.ALIGN_LEFT);
                    logoCell.addElement(logo);
                }
            } catch (Exception e) {
                // Ignore fallback if image fails, text is enough
            }
            headerTable.addCell(logoCell);

            // 2. Center Cell (Text)
            PdfPCell textCell = new PdfPCell();
            textCell.setBorder(Rectangle.NO_BORDER);
            textCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            textCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph title = new Paragraph("Jiva Thunai", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            textCell.addElement(title);
            
            Paragraph subTitle = new Paragraph("PAYMENT RECEIPT", subTitleFont);
            subTitle.setAlignment(Element.ALIGN_CENTER);
            textCell.addElement(subTitle);

            headerTable.addCell(textCell);

            // 3. Right Cell (Empty to balance the layout)
            PdfPCell emptyCell = new PdfPCell();
            emptyCell.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(emptyCell);

            document.add(headerTable);

            // Separator Line
            PdfPTable line = new PdfPTable(1);
            line.setWidthPercentage(100);
            PdfPCell lineCell = new PdfPCell(new Phrase(" "));
            lineCell.setBorder(Rectangle.BOTTOM);
            lineCell.setBorderColorBottom(primaryColor);
            lineCell.setBorderWidthBottom(2f);
            lineCell.setPaddingBottom(5f);
            line.addCell(lineCell);
            document.add(line);

            // Add spacing
            document.add(new Paragraph("\n"));

            // Details Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 2.5f});
            table.setSpacingBefore(15f);
            table.setSpacingAfter(20f);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy - HH:mm:ss");
            java.time.LocalDateTime dateToUse = payment.getUpdatedAt() != null ? payment.getUpdatedAt() : (payment.getCreatedAt() != null ? payment.getCreatedAt() : java.time.LocalDateTime.now());

            boolean isAlt = false;
            addTableRow(table, "Internal Order ID", payment.getInternalOrderId(), headerFont, normalFont, isAlt, lightBgColor); isAlt = !isAlt;
            addTableRow(table, "Razorpay Order ID", payment.getRazorpayOrderId(), headerFont, normalFont, isAlt, lightBgColor); isAlt = !isAlt;
            addTableRow(table, "Razorpay Payment ID", payment.getRazorpayPaymentId(), headerFont, normalFont, isAlt, lightBgColor); isAlt = !isAlt;
            addTableRow(table, "Customer Name", payment.getCustomerName() != null ? payment.getCustomerName() : "Guest User", headerFont, normalFont, isAlt, lightBgColor); isAlt = !isAlt;
            addTableRow(table, "Amount Paid", payment.getAmount() != null ? "Rs. " + payment.getAmount().toString() : "N/A", headerFont, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryColor), isAlt, lightBgColor); isAlt = !isAlt;
            addTableRow(table, "Payment Status", payment.getStatus() != null ? payment.getStatus().name() : "N/A", headerFont, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryColor), isAlt, lightBgColor); isAlt = !isAlt;
            addTableRow(table, "Date of Payment", dateToUse.format(formatter), headerFont, normalFont, isAlt, lightBgColor);

            document.add(table);

            // Footer
            Paragraph footer = new Paragraph("Thank you for choosing Jiva Thunai!\nFor any queries, please contact support@jivathunai.com", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(40f);
            document.add(footer);

            document.close();
            
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF receipt", e);
        }
    }

    private void addTableRow(PdfPTable table, String header, String value, Font headerFont, Font normalFont, boolean isAltRow, Color altColor) {
        PdfPCell headerCell = new PdfPCell(new Phrase(header != null ? header : "", headerFont));
        headerCell.setBorder(Rectangle.BOX);
        headerCell.setBorderColor(new Color(226, 232, 240)); // Slate 200
        headerCell.setPadding(10f);
        if (isAltRow) headerCell.setBackgroundColor(altColor);
        table.addCell(headerCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "N/A", normalFont));
        valueCell.setBorder(Rectangle.BOX);
        valueCell.setBorderColor(new Color(226, 232, 240));
        valueCell.setPadding(10f);
        if (isAltRow) valueCell.setBackgroundColor(altColor);
        table.addCell(valueCell);
    }
}
