import React, { useRef } from "react";
import { FiDownload, FiPrinter, FiX } from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Invoice.css";

const Invoice = ({ order, onClose }) => {
  const invoiceRef = useRef();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateInvoiceNumber = () => {
    return `INV-${order._id.slice(-8).toUpperCase()}`;
  };

  const downloadPDF = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`BrewHaven_Invoice_${generateInvoiceNumber()}.pdf`);
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (!order) return null;

  return (
    <div className="invoice-overlay">
      <div className="invoice-container">
        {/* Action Buttons */}
        <div className="invoice-actions">
          <button className="action-btn download" onClick={downloadPDF}>
            <FiDownload /> Download PDF
          </button>
          <button className="action-btn print" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button className="action-btn close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="invoice-content" ref={invoiceRef}>
          {/* Header */}
          <div className="invoice-header">
            <div className="company-info">
              <h1>☕ Brew Haven</h1>
              <p>Premium Coffee & Café</p>
              <p>123 Coffee Street, Mumbai, MH 400001</p>
              <p>Phone: +91 98765 43210</p>
              <p>Email: hello@brewhaven.com</p>
              <p>GSTIN: 27XXXXX1234X1ZX</p>
            </div>
            <div className="invoice-info">
              <h2>TAX INVOICE</h2>
              <table>
                <tbody>
                  <tr>
                    <td>Invoice No:</td>
                    <td>
                      <strong>{generateInvoiceNumber()}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Date:</td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                  <tr>
                    <td>Time:</td>
                    <td>{formatTime(order.createdAt)}</td>
                  </tr>
                  <tr>
                    <td>Order ID:</td>
                    <td>#{order._id.slice(-8).toUpperCase()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="invoice-parties">
            <div className="bill-to">
              <h3>Bill To:</h3>
              <p>
                <strong>{order.user?.name}</strong>
              </p>
              <p>{order.user?.email}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>
                {order.shippingAddress?.street}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
                <br />
                {order.shippingAddress?.zipCode}
              </p>
            </div>
            <div className="payment-info">
              <h3>Payment Details:</h3>
              <p>
                <strong>Method:</strong> Online (Razorpay)
              </p>
              <p>
                <strong>Payment ID:</strong> {order.paymentId}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="paid-badge">PAID</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>₹{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="invoice-summary">
            <div className="summary-spacer"></div>
            <div className="summary-table">
              <table>
                <tbody>
                  <tr>
                    <td>Subtotal:</td>
                    <td>₹{order.subtotal?.toFixed(2)}</td>
                  </tr>
                  {order.discount > 0 && (
                    <tr className="discount-row">
                      <td>
                        Discount {order.couponCode && `(${order.couponCode})`}:
                      </td>
                      <td>-₹{order.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr>
                    <td>CGST (9%):</td>
                    <td>₹{(order.tax / 2).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGST (9%):</td>
                    <td>₹{(order.tax / 2).toFixed(2)}</td>
                  </tr>
                  <tr className="total-row">
                    <td>
                      <strong>Total Amount:</strong>
                    </td>
                    <td>
                      <strong>₹{order.total.toFixed(2)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="amount-words">
            <p>
              <strong>Amount in Words:</strong> {numberToWords(order.total)}{" "}
              Rupees Only
            </p>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <div className="terms">
              <h4>Terms & Conditions:</h4>
              <ul>
                <li>This is a computer-generated invoice.</li>
                <li>No signature required.</li>
                <li>For queries, contact us at hello@brewhaven.com</li>
              </ul>
            </div>
            <div className="signature">
              <p>Authorized Signatory</p>
              <p>
                <strong>Brew Haven Café</strong>
              </p>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="invoice-thank-you">
            <p>Thank you for choosing Brew Haven! ☕</p>
            <p>Visit us again soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert number to words
const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numToWords = (n) => {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + numToWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        numToWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + numToWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        numToWords(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + numToWords(n % 100000) : "")
      );
    return (
      numToWords(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + numToWords(n % 10000000) : "")
    );
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = numToWords(rupees);
  if (paise > 0) {
    result += " and " + numToWords(paise) + " Paise";
  }
  return result;
};

export default Invoice;
