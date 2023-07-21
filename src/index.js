import express from "express";
import multer from "multer";
import nodeMailer from "nodemailer";
import bodyParser from "body-parser";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/send-mail", upload.single("attachment"), async function (req, res) {
  const { mail, subject, body } = req.body;
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
        user: process.env.MAIL_FROM || "preschoolats@gmail.com",
        pass: process.env.MAIL_PASS || "sjzqlmyuubaunzzg",
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    const mainOptions = {
      from: process.env.MAIL_FROM || "preschoolats@gmail.com",
      to: req.body.mail,
      subject: subject,
      attachments: attachment,
      // text: "Files export",
      html: body,
    };
    await transporter.sendMail(mainOptions);
    res.status(200).json({ message: "Send mail success" });
    fs.unlink(req.file.path, err => {
      if (err) {
        console.log(err);
      } else {
        console.log("File removed: " + req.file.path);
      }
    });
  } catch (error) {
    console.log("error send mail: ", error);
    res.status(500).json({ message: "Send mail fail" });
  }
});

const server = app.listen(PORT, error => {
  if (error) return console.log(`Error: ${error}`);
  console.log(`Server listening on port ${server.address().port}`);
});
