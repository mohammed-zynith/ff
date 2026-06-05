import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend({ apiKey: process.env.RESEND_API_KEY });

// Helper to get `from` address (use EMAIL_FROM if set, otherwise fallback to EMAIL_USER)
const getFromAddress = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;

// Email template for employee credentials
const createEmployeeEmailTemplate = (employeeData, loginUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #4361ee, #7209b7);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
            .credentials {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #4361ee;
            }
            .login-btn {
                display: inline-block;
                background: linear-gradient(135deg, #4361ee, #7209b7);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to Our Team! 🎉</h1>
        </div>
        <div class="content">
            <h2>Hello ${employeeData.personId},</h2>
            <p>Your employee account has been created successfully. Here are your login credentials:</p>
            
            <div class="credentials">
                <h3>Your Login Details:</h3>
                <p><strong>Employee ID:</strong> ${employeeData.personId}</p>
                <p><strong>Email:</strong> ${employeeData.email}</p>
                <p><strong>Password:</strong> ${employeeData.password}</p>
                <p><strong>Role:</strong> Employee</p>
            </div>

            <p>You can login using the button below:</p>
            <a href="${loginUrl}" class="login-btn">Login to Your Account</a>

            <div class="security-note">
                <h4>🔒 Security Tips:</h4>
                <ul>
                    <li>Keep your credentials secure</li>
                    <li>Change your password after first login</li>
                    <li>Do not share your login details with anyone</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <p>If you have any questions, please contact your administrator.</p>
            <p>© ${new Date().getFullYear()} Company Name. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
};

// Send employee credentials email
export const sendEmployeeCredentials = async (employeeData, plainPassword) => {
  try {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    const mailOptions = {
      from: {
        name: 'Company HR System',
        address: process.env.EMAIL_USER
      },
      to: employeeData.email,
      subject: 'Your Employee Account Credentials',
      html: createEmployeeEmailTemplate(
        { ...employeeData, password: plainPassword },
        loginUrl
      ),
      text: `Welcome to Our Team!
      
Your employee account has been created successfully.

Login Details:
- Employee ID: ${employeeData.personId}
- Email: ${employeeData.email}
- Password: ${plainPassword}
- Role: Employee

Login URL: ${loginUrl}

Please keep your credentials secure and change your password after first login.

Best regards,
Company HR Team`
    };

        const resp = await resend.emails.send({
            from: `${mailOptions.from.name} <${mailOptions.from.address}>`,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text,
        });

        console.log('Email sent via Resend:', resp.id);
        return { success: true, messageId: resp.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
        // Simple check: ensure API key present and try to send a lightweight test email to yourself
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not set');
            return false;
        }

        if (!getFromAddress()) {
            console.error('From address not configured (EMAIL_FROM or EMAIL_USER)');
            return false;
        }

        // Optionally send a test email only when TEST_EMAIL_TO is set
        if (process.env.TEST_EMAIL_TO) {
            const resp = await resend.emails.send({
                from: `${process.env.EMAIL_FROM || 'No Reply'} <${getFromAddress()}>`,
                to: process.env.TEST_EMAIL_TO,
                subject: 'Test email from Resend',
                html: '<p>This is a test email to verify Resend configuration.</p>',
            });
            console.log('Test email sent via Resend:', resp.id);
        }

        console.log('Resend configuration appears correct');
        return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

// Send payslip email
export const sendPayslipEmail = async (payslip) => {
  try {
        const mailOptions = {
            from: {
                name: 'Zynith IT Solutions - HR',
                address: getFromAddress()
            },
            to: payslip.email,
            subject: `Salary Payslip - ${payslip.month} ${payslip.year}`,
            html: createPayslipEmailTemplate(payslip),
            text: `Dear ${payslip.name},\n\nYour salary for ${payslip.month} ${payslip.year} has been processed.\n\nEmployee ID: ${payslip.employeeId}\nBasic Salary: $${payslip.basicSalary}\nGross Earnings: $${payslip.grossEarnings}\nTotal Deductions: $${payslip.totalDeductions}\nNet Pay: $${payslip.netPay}\n\nPlease find the attached payslip for detailed information.\n\nBest regards,\nZynith IT Solutions HR Team`
        };

        const resp = await resend.emails.send({
            from: `${mailOptions.from.name} <${mailOptions.from.address}>`,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text,
        });

        console.log('Payslip email sent via Resend:', resp.id);
        return { success: true, messageId: resp.id };
  } catch (error) {
    console.error('Error sending payslip email:', error);
    return { success: false, error: error.message };
  }
};

// Payslip email template
const createPayslipEmailTemplate = (payslip) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #4361ee, #7209b7);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
            .salary-summary {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #4361ee;
            }
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin: 1rem 0;
            }
            .net-pay {
                background: #dcfce7;
                padding: 1rem;
                border-radius: 8px;
                text-align: center;
                font-weight: bold;
                font-size: 1.2rem;
                margin: 1rem 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Zynith IT Solutions</h1>
            <h2>Salary Payslip</h2>
        </div>
        <div class="content">
            <h2>Hello ${payslip.name},</h2>
            <p>Your salary for <strong>${payslip.month} ${payslip.year}</strong> has been processed successfully.</p>
            
            <div class="salary-summary">
                <h3>Salary Details</h3>
                <div class="details-grid">
                    <div>
                        <strong>Employee ID:</strong><br>
                        ${payslip.employeeId}
                    </div>
                    <div>
                        <strong>Pay Date:</strong><br>
                        ${new Date(payslip.payDate).toLocaleDateString()}
                    </div>
                </div>
                
                <h4>Earnings</h4>
                <p><strong>Basic Salary:</strong> $${payslip.basicSalary.toFixed(2)}</p>
                ${payslip.earnings.map(earning => `
                    <p><strong>${earning.type}:</strong> $${earning.amount.toFixed(2)}</p>
                `).join('')}
                <p><strong>Gross Earnings:</strong> $${payslip.grossEarnings.toFixed(2)}</p>
                
                <h4>Deductions</h4>
                ${payslip.deductions.map(deduction => `
                    <p><strong>${deduction.type}:</strong> $${deduction.amount.toFixed(2)}</p>
                `).join('')}
                <p><strong>Total Deductions:</strong> $${payslip.totalDeductions.toFixed(2)}</p>
                
                <div class="net-pay">
                    Net Pay: $${payslip.netPay.toFixed(2)}
                </div>
                
                <p><strong>Paid Days:</strong> ${payslip.paidDays}</p>
                <p><strong>LOP Days:</strong> ${payslip.lopDays}</p>
            </div>
            
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
        <div class="footer">
            <p>If you have any questions, please contact the HR department.</p>
            <p>© ${new Date().getFullYear()} Zynith IT Solutions. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
};

// Add this function to your existing emailService.js

// OTP email template for password reset
const createOTPEmailTemplate = (otp, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 500px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #5acd62, #3a9440);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f8faf9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
                border: 1px solid #e0e0e0;
                border-top: none;
            }
            .otp-box {
                background: white;
                padding: 25px;
                text-align: center;
                border-radius: 12px;
                margin: 25px 0;
                border: 2px dashed #3a9440;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #06510f;
                font-family: monospace;
                background: #f0fdf4;
                padding: 15px;
                border-radius: 8px;
                display: inline-block;
            }
            .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px;
                margin: 20px 0;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #5acd62, #3a9440);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 0;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName || 'User'},</h2>
                <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
                
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul style="margin: 5px 0 0 20px; padding: 0;">
                        <li>This OTP is valid for only 10 minutes</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                </div>
                
                <p style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.FRONTEND_URL}/reset-password" class="button">Reset Password</a>
                </p>
            </div>
            <div class="footer">
                <p>If you have any issues, please contact support.</p>
                <p>© ${new Date().getFullYear()} Zynith IT Solutions. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send OTP for password reset
export const sendPasswordResetOTP = async (email, otp, userName) => {
  try {
        const mailOptions = {
            from: {
                name: 'Zynith IT Solutions - Security',
                address: getFromAddress()
            },
            to: email,
            subject: 'Password Reset OTP - Zynith IT Solutions',
            html: createOTPEmailTemplate(otp, userName),
            text: `Password Reset Request\n\nYour OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nZynith IT Solutions Security Team`
        };

        const resp = await resend.emails.send({
            from: `${mailOptions.from.name} <${mailOptions.from.address}>`,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text,
        });

        console.log('OTP email sent via Resend:', resp.id);
        return { success: true, messageId: resp.id };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};