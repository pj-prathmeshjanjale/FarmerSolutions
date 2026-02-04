import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order) => {
    try {
        console.log("Generating invoice for order:", order);
        const doc = new jsPDF();

        // -- Colors & Fonts --
        const primaryColor = [16, 185, 129]; // Emerald 500
        const secondaryColor = [71, 85, 105]; // Slate 600

        // -- Header --
        // Company Logo/Name
        doc.setFontSize(22);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("FarmSolutions", 20, 20);

        // Invoice Label
        doc.setFontSize(30);
        doc.setTextColor(200, 200, 200); // Light Gray
        doc.text("INVOICE", 150, 20);

        // -- Invoice Details --
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        const date = new Date(order.createdAt).toLocaleDateString();
        const invoiceId = `INV-${order._id.slice(-6).toUpperCase()}`;

        doc.text(`Invoice No: ${invoiceId}`, 150, 30);
        doc.text(`Date: ${date}`, 150, 35);
        doc.text(`Order ID: ${order._id}`, 150, 40);

        // -- Billing Info --
        doc.setFontSize(12);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", 20, 50);

        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.setFont("helvetica", "normal");

        // Fallback if not populated, assuming buyer is the user but using shipping address for context
        doc.text(order.shippingAddress || "N/A", 20, 55, { maxWidth: 80 });

        // -- Table Items --
        const item = order.product || order.equipment;
        const itemName = item?.name || "Unknown Item";
        const itemType = order.orderType === "RENT" ? "Rental" : "Purchase";
        // Safe check for price calculation
        const price = order.quantity ? (order.amount / order.quantity) : 0;

        const tableRows = [
            [
                itemName,
                itemType,
                order.quantity || 1,
                `Rs. ${price.toLocaleString()}`,
                order.paymentMethod || "COD",
                (order.status || "PLACED").replace("_", " "),
                `Rs. ${(order.amount || 0).toLocaleString()}`
            ]
        ];

        autoTable(doc, {
            startY: 90,
            head: [["Item", "Type", "Quantity", "Unit Price", "Payment", "Status", "Total"]],
            body: tableRows,
            theme: "grid",
            headStyles: { fillColor: primaryColor, textColor: 255 },
            styles: { fontSize: 10, cellPadding: 3 },
        });

        // -- Total --
        const finalY = (doc.lastAutoTable?.finalY || 90) + 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total: Rs. ${(order.amount || 0).toLocaleString()}`, 150, finalY, { align: "left" });

        // -- Footer --
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for your business!", 105, 280, { align: "center" });
        doc.text("For support, contact: support@farmsolutions.com", 105, 285, { align: "center" });

        // -- Save --
        console.log("Saving PDF...");
        doc.save(`Invoice_${invoiceId}.pdf`);
        console.log("PDF Saved successfully");
    } catch (error) {
        console.error("Error generating invoice:", error);
        alert("Failed to generate invoice. Please check the console for more details.");
    }
};
