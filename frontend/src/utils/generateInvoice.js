import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional, minimalist PDF invoice/receipt for a given order.
 * @param {Object} order - The order object from the backend.
 * @param {Object} user  - The logged-in user object { name, email }.
 */
export const generateInvoice = (order, user) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // ─── Color palette (Slate / Charcoal Minimalist) ───
    const textMain = [15, 23, 42];       // slate-900
    const textMuted = [100, 116, 139];   // slate-500
    const textLight = [148, 163, 184];   // slate-400
    const borderLight = [226, 232, 240]; // slate-200
    const bgLight = [248, 250, 252];     // slate-50

    // ─── Helpers ───
    const formatCurrency = (val) =>
        'Rs. ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });

    const formatDateTime = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const orderId = order._id ? order._id.slice(-8).toUpperCase() : 'N/A';

    // ═══════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════
    
    // Logo / Company Name
    doc.setTextColor(...textMain);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('ShopFlow.', margin, y + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textMuted);
    doc.text('shopflow.com', margin, y + 14);

    // Invoice Label Right aligned
    doc.setTextColor(...textLight);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, y + 8, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text(`Invoice No: #${orderId}`, pageWidth - margin, y + 14, { align: 'right' });

    y += 35;

    // ═══════════════════════════════════════════
    // CUSTOMER & ORDER INFO (Minimalist Layout)
    // ═══════════════════════════════════════════
    
    // Billed To
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textLight);
    doc.text('BILLED TO', margin, y);
    
    doc.setFontSize(10);
    doc.setTextColor(...textMain);
    doc.text(user?.name || 'Customer', margin, y + 6);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text(user?.email || '', margin, y + 11);
    
    if (order.shippingAddress) {
        const addr = order.shippingAddress;
        doc.text(addr.address || '', margin, y + 16);
        doc.text(`${addr.city || ''} ${addr.postalCode ? '- ' + addr.postalCode : ''}`, margin, y + 21);
    }

    // Invoice Details Right aligned block
    const detailsX = pageWidth - margin - 50;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textLight);
    doc.text('INVOICE DATE', detailsX, y);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMain);
    doc.text(formatDate(order.createdAt), detailsX, y + 5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textLight);
    doc.text('PAYMENT METHOD', detailsX, y + 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMain);
    doc.text(order.paymentMethod || 'Online', detailsX, y + 19);

    const isPaid = order.paymentStatus === 'Paid' || order.isPaid;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textLight);
    doc.text('PAYMENT STATUS', detailsX + 50, y, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(isPaid ? [16, 185, 129] : [245, 158, 11] )); // emerald-500 : amber-500
    doc.text(isPaid ? 'PAID' : order.paymentMethod === 'COD' ? 'COD' : 'PENDING', detailsX + 50, y + 5, { align: 'right' });

    y += 35;

    // Transaction ID row (if applicable)
    if (order.transactionId) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textMuted);
        doc.text(`Transaction Reference: ${order.transactionId}`, margin, y);
        y += 8;
    }

    y += 5;

    // ═══════════════════════════════════════════
    // ITEMS TABLE (Clean, minimalist borders)
    // ═══════════════════════════════════════════
    const tableBody = (order.orderItems || []).map((item) => [
        (item.title || 'Product').substring(0, 50),
        item.size || '—',
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity),
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Description', 'Size', 'Qty', 'Unit Price', 'Amount']],
        body: tableBody,
        theme: 'plain',
        headStyles: {
            fillColor: bgLight,
            textColor: textMain,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: { top: 6, bottom: 6, left: 4, right: 4 },
        },
        bodyStyles: {
            fontSize: 9,
            textColor: textMuted,
            cellPadding: { top: 6, bottom: 6, left: 4, right: 4 },
        },
        columnStyles: {
            0: { halign: 'left', cellWidth: 'auto', fontStyle: 'bold', textColor: textMain },
            1: { halign: 'center', cellWidth: 20 },
            2: { halign: 'center', cellWidth: 15 },
            3: { halign: 'right', cellWidth: 30 },
            4: { halign: 'right', cellWidth: 35 },
        },
        didParseCell: function (data) {
            // Right align specific headers
            if (data.section === 'head' && (data.column.index === 3 || data.column.index === 4)) {
                data.cell.styles.halign = 'right';
            }
            if (data.section === 'head' && (data.column.index === 1 || data.column.index === 2)) {
                data.cell.styles.halign = 'center';
            }
        },
        didDrawCell: function (data) {
            // Add a subtle bottom border to cells
            if (data.section === 'body' && data.row.index !== tableBody.length - 1) {
                doc.setDrawColor(...borderLight);
                doc.setLineWidth(0.1);
                doc.line(
                    data.cell.x,
                    data.cell.y + data.cell.height,
                    data.cell.x + data.cell.width,
                    data.cell.y + data.cell.height
                );
            }
            // Add top and bottom borders to header
            if (data.section === 'head') {
                doc.setDrawColor(...borderLight);
                doc.setLineWidth(0.5);
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
            }
        },
        margin: { left: margin, right: margin },
    });

    y = doc.lastAutoTable.finalY + 15;

    // ═══════════════════════════════════════════
    // SUMMARY / TOTALS 
    // ═══════════════════════════════════════════
    const summaryWidth = 80;
    const summaryX = pageWidth - margin - summaryWidth;

    const subtotal = (order.orderItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

    let summaryY = y;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.setTextColor(...textMuted);
    doc.text('Subtotal', summaryX, summaryY);
    doc.setTextColor(...textMain);
    doc.text(formatCurrency(subtotal), summaryX + summaryWidth, summaryY, { align: 'right' });
    summaryY += 8;

    // Discount
    if (order.discountAmount > 0) {
        doc.setTextColor(...textMuted);
        doc.text(`Discount ${order.couponCode ? '(' + order.couponCode + ')' : ''}`, summaryX, summaryY);
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.text(`-${formatCurrency(order.discountAmount)}`, summaryX + summaryWidth, summaryY, { align: 'right' });
        summaryY += 8;
    }

    // Shipping
    doc.setTextColor(...textMuted);
    doc.text('Shipping', summaryX, summaryY);
    doc.setTextColor(...textMain);
    doc.text('Rs. 100.00', summaryX + summaryWidth, summaryY, { align: 'right' });
    summaryY += 5;

    // Divider
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.5);
    doc.line(summaryX, summaryY, summaryX + summaryWidth, summaryY);
    summaryY += 8;

    // Grand Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textMain);
    doc.text('Total', summaryX, summaryY);
    doc.text(formatCurrency(order.totalPrice), summaryX + summaryWidth, summaryY, { align: 'right' });

    // ═══════════════════════════════════════════
    // FOOTER (Minimalist)
    // ═══════════════════════════════════════════
    const footerY = doc.internal.pageSize.getHeight() - 25;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textLight);
    doc.text('ShopFlow Inc.', margin, footerY);
    doc.text('support@shopflow.com', margin, footerY + 5);
    doc.text('+91 1800-123-4567', margin, footerY + 10);

    doc.text('Thank you for shopping with us.', pageWidth - margin, footerY, { align: 'right' });
    doc.text(`Generated on ${formatDateTime(new Date().toISOString())}`, pageWidth - margin, footerY + 5, { align: 'right' });

    // ─── Save ───
    doc.save(`Invoice_${orderId}.pdf`);
};

export default generateInvoice;
