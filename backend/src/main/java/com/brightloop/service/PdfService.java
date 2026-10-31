package com.brightloop.service;

import com.brightloop.entity.Invoice;
import com.brightloop.entity.InvoiceLine;
import com.brightloop.entity.Quotation;
import com.brightloop.entity.QuotationLine;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    // Colors matching modern enterprise SaaS theme
    private static final Color PRIMARY_COLOR = new Color(79, 70, 229); // Indigo 600
    private static final Color DARK_NAVY = new Color(15, 23, 42); // Slate 900
    private static final Color MUTED_GRAY = new Color(100, 116, 139); // Slate 500
    private static final Color LIGHT_BG = new Color(248, 250, 252); // Slate 50
    private static final Color BORDER_COLOR = new Color(226, 232, 240); // Slate 200

    public byte[] generateInvoicePdf(Invoice invoice) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Header with Brand & Invoice Info
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, PRIMARY_COLOR);
            Paragraph brandTitle = new Paragraph("BRIGHTLOOP", titleFont);
            Paragraph brandSub = new Paragraph("Subscription & Billing Engine", FontFactory.getFont(FontFactory.HELVETICA, 10, MUTED_GRAY));
            Paragraph brandAddr = new Paragraph("Whitefield Tech Hub, Bengaluru - 560066\ncontact@brightloop.com | +91 80 4000 8888", FontFactory.getFont(FontFactory.HELVETICA, 9, MUTED_GRAY));

            brandCell.addElement(brandTitle);
            brandCell.addElement(brandSub);
            brandCell.addElement(brandAddr);
            headerTable.addCell(brandCell);

            PdfPCell invMetaCell = new PdfPCell();
            invMetaCell.setBorder(Rectangle.NO_BORDER);
            invMetaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Font invHeadingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, DARK_NAVY);
            Paragraph invHeading = new Paragraph("TAX INVOICE", invHeadingFont);
            invHeading.setAlignment(Element.ALIGN_RIGHT);
            invMetaCell.addElement(invHeading);

            Paragraph invDetails = new Paragraph(
                    "Invoice #: " + invoice.getInvoiceNumber() + "\n" +
                    "Date: " + invoice.getInvoiceDate().format(DATE_FORMATTER) + "\n" +
                    "Due Date: " + invoice.getDueDate().format(DATE_FORMATTER) + "\n" +
                    "Status: " + invoice.getStatus(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, DARK_NAVY)
            );
            invDetails.setAlignment(Element.ALIGN_RIGHT);
            invMetaCell.addElement(invDetails);
            headerTable.addCell(invMetaCell);

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // 2. Bill-To Customer Box
            PdfPTable billToTable = new PdfPTable(1);
            billToTable.setWidthPercentage(100);
            PdfPCell billToCell = new PdfPCell();
            billToCell.setBackgroundColor(LIGHT_BG);
            billToCell.setBorderColor(BORDER_COLOR);
            billToCell.setPadding(10);

            Paragraph billToHeader = new Paragraph("BILLED TO:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, PRIMARY_COLOR));
            Paragraph custName = new Paragraph(invoice.getCustomer().getFullName() +
                    (invoice.getCustomer().getCompanyName() != null ? " (" + invoice.getCustomer().getCompanyName() + ")" : ""),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, DARK_NAVY));
            String address = (invoice.getCustomer().getBillingAddress() != null ? invoice.getCustomer().getBillingAddress() + ", " : "") +
                    (invoice.getCustomer().getCity() != null ? invoice.getCustomer().getCity() + ", " : "") +
                    (invoice.getCustomer().getState() != null ? invoice.getCustomer().getState() + " - " : "") +
                    (invoice.getCustomer().getPostalCode() != null ? invoice.getCustomer().getPostalCode() : "");
            Paragraph custAddr = new Paragraph(address + "\nEmail: " + invoice.getCustomer().getEmail() +
                    (invoice.getCustomer().getTaxId() != null ? " | GSTIN/Tax ID: " + invoice.getCustomer().getTaxId() : ""),
                    FontFactory.getFont(FontFactory.HELVETICA, 9, DARK_NAVY));

            billToCell.addElement(billToHeader);
            billToCell.addElement(custName);
            billToCell.addElement(custAddr);
            billToTable.addCell(billToCell);

            document.add(billToTable);
            document.add(new Paragraph("\n"));

            // 3. Line Items Table
            PdfPTable itemsTable = new PdfPTable(6);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{40, 10, 15, 10, 10, 15});

            addTableHeader(itemsTable, "Item / Description");
            addTableHeader(itemsTable, "Qty");
            addTableHeader(itemsTable, "Unit Price");
            addTableHeader(itemsTable, "Tax %");
            addTableHeader(itemsTable, "Discount");
            addTableHeader(itemsTable, "Total (₹)");

            for (InvoiceLine line : invoice.getLines()) {
                addTableCell(itemsTable, line.getDescription(), Element.ALIGN_LEFT);
                addTableCell(itemsTable, String.valueOf(line.getQuantity()), Element.ALIGN_CENTER);
                addTableCell(itemsTable, "₹" + line.getUnitPrice().setScale(2), Element.ALIGN_RIGHT);
                addTableCell(itemsTable, line.getTaxRate().setScale(1) + "%", Element.ALIGN_RIGHT);
                addTableCell(itemsTable, "₹" + line.getDiscountAmount().setScale(2), Element.ALIGN_RIGHT);
                addTableCell(itemsTable, "₹" + line.getTotal().setScale(2), Element.ALIGN_RIGHT);
            }

            document.add(itemsTable);
            document.add(new Paragraph("\n"));

            // 4. Totals & Payment Summary Box
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{55, 45});

            PdfPCell termsCell = new PdfPCell();
            termsCell.setBorder(Rectangle.NO_BORDER);
            Paragraph termsPara = new Paragraph(
                    "Payment Terms: " + (invoice.getPaymentTerms() != null ? invoice.getPaymentTerms() : "Net 15") + "\n" +
                    "Notes: " + (invoice.getNotes() != null ? invoice.getNotes() : "Thank you for subscribing with BrightLoop!"),
                    FontFactory.getFont(FontFactory.HELVETICA, 9, MUTED_GRAY)
            );
            termsCell.addElement(termsPara);
            summaryTable.addCell(termsCell);

            PdfPCell totalsCell = new PdfPCell();
            totalsCell.setBorder(Rectangle.NO_BORDER);
            totalsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            PdfPTable totalsInner = new PdfPTable(2);
            totalsInner.setWidthPercentage(100);
            totalsInner.setWidths(new float[]{55, 45});

            addSummaryRow(totalsInner, "Subtotal:", "₹" + invoice.getSubtotal().setScale(2));
            addSummaryRow(totalsInner, "Tax Amount:", "₹" + invoice.getTotalTax().setScale(2));
            addSummaryRow(totalsInner, "Discount Applied:", "-₹" + invoice.getTotalDiscount().setScale(2));
            addSummaryRow(totalsInner, "Grand Total:", "₹" + invoice.getGrandTotal().setScale(2), true);
            addSummaryRow(totalsInner, "Amount Paid:", "₹" + invoice.getAmountPaid().setScale(2));
            addSummaryRow(totalsInner, "Outstanding Balance:", "₹" + invoice.getAmountOutstanding().setScale(2), true);

            totalsCell.addElement(totalsInner);
            summaryTable.addCell(totalsCell);

            document.add(summaryTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF for invoice: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    public byte[] generateQuotationPdf(Quotation quotation) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Header
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.addElement(new Paragraph("BRIGHTLOOP", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, PRIMARY_COLOR)));
            brandCell.addElement(new Paragraph("Subscription Proposal & Estimate", FontFactory.getFont(FontFactory.HELVETICA, 10, MUTED_GRAY)));
            headerTable.addCell(brandCell);

            PdfPCell qtnMetaCell = new PdfPCell();
            qtnMetaCell.setBorder(Rectangle.NO_BORDER);
            Paragraph qtnHeading = new Paragraph("QUOTATION", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, DARK_NAVY));
            qtnHeading.setAlignment(Element.ALIGN_RIGHT);
            qtnMetaCell.addElement(qtnHeading);

            Paragraph qtnDetails = new Paragraph(
                    "Quotation #: " + quotation.getQuotationNumber() + "\n" +
                    "Date: " + quotation.getCreationDate().format(DATE_FORMATTER) + "\n" +
                    "Valid Until: " + quotation.getExpiryDate().format(DATE_FORMATTER) + "\n" +
                    "Status: " + quotation.getStatus(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, DARK_NAVY)
            );
            qtnDetails.setAlignment(Element.ALIGN_RIGHT);
            qtnMetaCell.addElement(qtnDetails);
            headerTable.addCell(qtnMetaCell);

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // Recipient
            PdfPTable billToTable = new PdfPTable(1);
            billToTable.setWidthPercentage(100);
            PdfPCell billToCell = new PdfPCell();
            billToCell.setBackgroundColor(LIGHT_BG);
            billToCell.setBorderColor(BORDER_COLOR);
            billToCell.setPadding(10);
            billToCell.addElement(new Paragraph("PROPOSAL FOR:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, PRIMARY_COLOR)));
            billToCell.addElement(new Paragraph(quotation.getCustomer().getFullName() +
                    (quotation.getCustomer().getCompanyName() != null ? " (" + quotation.getCustomer().getCompanyName() + ")" : ""),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, DARK_NAVY)));
            billToTable.addCell(billToCell);
            document.add(billToTable);
            document.add(new Paragraph("\n"));

            // Items Table
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{45, 10, 15, 15, 15});

            addTableHeader(itemsTable, "Product / Service");
            addTableHeader(itemsTable, "Qty");
            addTableHeader(itemsTable, "Unit Price");
            addTableHeader(itemsTable, "Tax");
            addTableHeader(itemsTable, "Total (₹)");

            for (QuotationLine line : quotation.getLines()) {
                String desc = line.getProduct().getName() +
                        (line.getVariant() != null ? " (" + line.getVariant().getAttributeValue() + ")" : "");
                addTableCell(itemsTable, desc, Element.ALIGN_LEFT);
                addTableCell(itemsTable, String.valueOf(line.getQuantity()), Element.ALIGN_CENTER);
                addTableCell(itemsTable, "₹" + line.getUnitPrice().setScale(2), Element.ALIGN_RIGHT);
                addTableCell(itemsTable, "₹" + line.getTaxAmount().setScale(2), Element.ALIGN_RIGHT);
                addTableCell(itemsTable, "₹" + line.getTotal().setScale(2), Element.ALIGN_RIGHT);
            }

            document.add(itemsTable);
            document.add(new Paragraph("\n"));

            // Grand Total
            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(100);
            totalsTable.setWidths(new float[]{60, 40});

            PdfPCell empty = new PdfPCell();
            empty.setBorder(Rectangle.NO_BORDER);
            totalsTable.addCell(empty);

            PdfPTable tInner = new PdfPTable(2);
            tInner.setWidthPercentage(100);
            addSummaryRow(tInner, "Subtotal:", "₹" + quotation.getSubtotal().setScale(2));
            addSummaryRow(tInner, "Tax:", "₹" + quotation.getTaxAmount().setScale(2));
            addSummaryRow(tInner, "Discount:", "-₹" + quotation.getDiscountAmount().setScale(2));
            addSummaryRow(tInner, "Grand Total:", "₹" + quotation.getGrandTotal().setScale(2), true);

            PdfPCell tCell = new PdfPCell(tInner);
            tCell.setBorder(Rectangle.NO_BORDER);
            totalsTable.addCell(tCell);

            document.add(totalsTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF for quotation: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        cell.setBackgroundColor(PRIMARY_COLOR);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 9, DARK_NAVY)));
        cell.setHorizontalAlignment(align);
        cell.setBorderColor(BORDER_COLOR);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String label, String value) {
        addSummaryRow(table, label, value, false);
    }

    private void addSummaryRow(PdfPTable table, String label, String value, boolean isBold) {
        Font font = FontFactory.getFont(isBold ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA, isBold ? 11 : 9, DARK_NAVY);
        PdfPCell lCell = new PdfPCell(new Phrase(label, font));
        lCell.setBorder(Rectangle.NO_BORDER);
        lCell.setPadding(3);

        PdfPCell vCell = new PdfPCell(new Phrase(value, font));
        vCell.setBorder(Rectangle.NO_BORDER);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vCell.setPadding(3);

        table.addCell(lCell);
        table.addCell(vCell);
    }
}
