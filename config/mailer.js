const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // ou outro serviço
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOrderConfirmation(to, orderDetails) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Order Confirmation",
    html: `
      <h2>Thank you for your order!</h2>
      <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>
      <p><strong>Total Price:</strong> €${orderDetails.totalPrice.toFixed(2)}</p>
      <h3>Items:</h3>
      <ul>
        ${orderDetails.petFood.map(item => `
          <li>${item.name} (x${item.quantity}) - €${item.price.toFixed(2)} each</li>
        `).join("")}
      </ul>
      <p>Status: <strong>${orderDetails.status}</strong></p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOrderConfirmation };
