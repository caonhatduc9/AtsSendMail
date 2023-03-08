import express from "express";
import multer from "multer";
import nodeMailer from "nodemailer";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/send-mail", upload.single("attachment"), async function (req, res) {
  const { mail, subject } = req.body;
  let attachment = null;
  if (req.file) {
    attachment = {
      filename: req.file.originalname,
      path: req.file.path,
    };
  }

  try {
    let transporter = nodeMailer.createTransport({
      // config mail server
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: process.env.MAIL_PORT || 465,
      secure: true,
      auth: {
        user: process.env.MAIL_FROM || "caoduc4work@gmail.com",
        pass: process.env.MAIL_PASS || "okfxfiaayvvqqfvi",
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
    let content = "";
    content += `
        <div style="padding: 10px; background-color: #5D9C59">
            <div style="padding: 10px; background-color: white;">
                <span style="color: black">File export</span>
            </div>
        </div>
    `;
    const mainOptions = {
      from: process.env.MAIL_FROM || "caoduc4work@gmail.com",
      to: req.body.mail,
      subject: subject,
      attachments: attachment,
      // text: "Files export",
      html: content,
    };
    await transporter.sendMail(mainOptions);
    res.status(200).json({ message: "Send mail success" });
  } catch (error) {
    console.log("error send mail: ", error);
    res.status(500).json({ message: "Send mail fail" });
  }
});

const server = app.listen(PORT, error => {
  if (error) return console.log(`Error: ${error}`);
  console.log(`Server listening on port ${server.address().port}`);
});
