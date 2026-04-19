export const escapeHtml = (unsafe: string) => {
    return (unsafe || '').toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const printInvoice = (order: any) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return alert('Please allow popups to print invoices.');

    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice #${escapeHtml(order.id).slice(-6).toUpperCase()}</title>
                <style>
                    body { font-family: system-ui, sans-serif; padding: 2rem; color: #111; max-width: 800px; margin: 0 auto; }
                    h1 { color: #059669; margin-bottom: 0.5rem; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
                    .details { display: grid; gap: 0.5rem; margin-bottom: 2rem; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee; }
                    th { background: #f9fafb; font-weight: 600; color: #4b5563; }
                    .total { text-align: right; font-size: 1.25rem; font-weight: bold; margin-top: 2rem; border-top: 2px solid #eee; padding-top: 1rem; }
                    .footer { text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 4rem; border-top: 1px solid #eee; padding-top: 1rem; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>Order German</h1>
                        <p>Premium Fast Food</p>
                    </div>
                    <div style="text-align: right">
                        <h2>INVOICE</h2>
                        <p>#${escapeHtml(order.id).slice(-6).toUpperCase()}</p>
                        <p>${new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div class="details">
                    <strong>Bill To:</strong>
                    <div>${escapeHtml(order.guestName || order.user?.email || 'N/A')}</div>
                    <div>${escapeHtml(order.guestAddress || order.user?.address || 'N/A')}</div>
                    <div>${escapeHtml(order.guestPhone || order.user?.phone || 'N/A')}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map((oi: any) => {
        const toppingsStr = oi.toppings?.length ? '<br><small style="color: #6b7280">+ ' + oi.toppings.map((t: any) => escapeHtml(t.toppingOption?.name)).join(', ') + '</small>' : '';
        return '<tr><td>' + escapeHtml(oi.menuItem?.name || '') + toppingsStr + '</td><td>' + oi.quantity + '</td><td>€' + oi.price.toFixed(2) + '</td><td>€' + (oi.price * oi.quantity).toFixed(2) + '</td></tr>';
    }).join('')}
                        ${order.shippingFee > 0 ? `
                            <tr>
                                <td>Shipping Fee</td>
                                <td>1</td>
                                <td>€${(order.shippingFee).toFixed(2)}</td>
                                <td>€${(order.shippingFee).toFixed(2)}</td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>

                <div class="total">
                    Total Amount: €${order.totalAmount.toFixed(2)}
                </div>

                <div class="footer">
                    Thank you for ordering with Order German!<br>
                    This is a computer generated invoice.
                </div>
                <script>
                    window.onload = () => { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
};
