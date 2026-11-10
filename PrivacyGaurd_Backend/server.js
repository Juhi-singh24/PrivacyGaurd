import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import authMiddleware from "./authmiddleware.js";
import crypto from "crypto";
import transporter from "./config/mailer.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const openrouter_api_key = process.env.OPEN_ROUTER_API_KEY;
const emailAddress = process.env.EMAIL_USER;
const password = process.env.APP_PASSWORD;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openrouter_api_key,
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected Successfully");
  })

  .catch((error) => {
    console.log("Mongodb connection error :", error);
  });

const userSchema = new mongoose.Schema({
  userName: String,
  email: String,
  password: String,
  resetTokenHash: {
    type: String,
    default: undefined,
  },
  resetTokenExpiry: {
    type: Date,
    default: undefined,
  },
});

const userModel = mongoose.model("userModel", userSchema);
const applicationschema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: String,
  purpose: String,
  permissions: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  permissionAnalysis: [
    {
      permission: String,
      compatibility: String,
      privacyRisk: String,
      explanation: String,
      recommendation: String,
    },
  ],
  overallAnalysis: {
    compatibility: String,
    privacyRisk: String,
    explanation: String,
    recommendation: String,
  },

  changes: {
    type: {
      permissions: {
        added: [String],
        removed: [String],
        unchanged: [String],
      },
      overall: {
        previousCompatibility: String,
        currentCompatibility: String,
        previousPrivacyRisk: String,
        currentPrivacyRisk: String,
      },
    },
    default: undefined,
  },
});

const Application = mongoose.model("Application", applicationschema);

app.post("/api/register", async (req, res) => {
  try {
    const user_name = req.body.userName;
    const user_email = req.body.email;
    const user_password = req.body.password;
    const minimumAllowedLength = 8;

    if (typeof user_name !== "string" || user_name.trim() === "") {
      return res.status(400).json({
        field: "name",
        message: "Please fill your Full Name",
      });
    } else if (typeof user_email !== "string" || user_email.trim() === "") {
      return res.status(400).json({
        field: "email",
        message: "Please fill your email correctly",
      });
    }

    const email_exist = await userModel.findOne({ email: user_email });

    if (email_exist) {
      return res.status(400).json({
        field: "email",
        message: "Please fill another email it already exist",
      });
    } else if (
      typeof user_password !== "string" ||
      user_password.length < minimumAllowedLength
    ) {
      return res.status(400).json({
        field: "password",
        message: "Please fill the password of atleast 8 characters",
      });
    }

    const hash_password = await bcrypt.hash(user_password, 12);

    const data_save = await userModel.create({
      userName: user_name,
      email: user_email,
      password: hash_password,
    });

    res.status(200).json({
      message: "Data is saved correctly",
    });
  } catch (error) {
    res.status(500).json({
      message: "Data is not retrived successfully",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const email_login = req.body.userEmailId;
    const user_password = req.body.userPassword;
    const minimumAllowedLength = 8;

    if (email_login.trim() === "" || typeof email_login !== "string") {
      return res.status(400).json({
        field: "user_email",
        message: "Please fill the email e.g xyz@gmail.com",
      });
    }

    const email_saved = await userModel.findOne({ email: email_login });

    console.log("Email received:", email_login);
    console.log("User found:", Boolean(email_saved));

    if (!email_saved) {
      return res.status(400).json({
        field: "user_email",
        message:
          "We couldn't find an account with this email. Please check your email or create a new account.",
      });
    }

    if (
      typeof user_password !== "string" ||
      user_password.trim() === "" ||
      user_password.length < minimumAllowedLength
    ) {
      return res.status(400).json({
        field: "user_password",
        message: "Please fill the password of atleast 8 characters",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      user_password,
      email_saved.password,
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        field: "user_password",
        message: "Password is incorrect please fill correct password",
      });
    }

    const token = jwt.sign(
      { userId: email_saved._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Login failed",
    });
  }
});

app.get('/api/me',authMiddleware, async(req,res) => {
  try{
    const userExist = await userModel.findOne({_id:req.userId});
    if(!userExist){
      return res.status(401).json({
        message:"Authenticated user doesn't exist"})
    }

    return res.status(200).json({
      message:"Authenticated User exist",
      user:userExist.userName,
      userEmail:userExist.userEmail

    })
  }
  catch(error){
    return res.status(500).json({
      message:"Internal Server Error"
    })
  }
});



app.post("/api/forgot-password", async (req, res) => {
  try {
    const email = req.body.Email;

    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        field: "email",
        message: "Please fill the email",
      });
    }

    const find_email = await userModel.findOne({ email: email });

    if (!find_email) {
      return res.status(400).json({
        field: "email",
        message: "Invalid Email.Please fill correct email.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    find_email.resetTokenHash = hashResetToken;
    find_email.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await find_email.save();

    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.emailAddress,
      to: find_email.email,
      subject: "Reset Your PrivacyGuard Password",
      html: `
      <div style="
      font-family: Arial, sans-serif;
      max-width: 550px;
      margin: auto;
      padding: 25px;
      background-color: #f8f9fc;
      border-radius: 10px;
      color: #333;
    ">

      <h2 style="color: #4f46e5; text-align: center;">
        PrivacyGuard
      </h2>

      <h3>Hello,</h3>

      <p>
        We received a request to reset the password
        for your PrivacyGuard account.
      </p>

      <p>
        To choose a new password, click the button below:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}"
          style="
            background-color: #4f46e5;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          ">
          Reset Your Password
        </a>
      </div>

      <p>
        For your security, this link will expire in
        <strong>15 minutes</strong> and can only be used once.
      </p>

      <p>
        If you didn't request a password reset,
        you can safely ignore this email.
        Your password will remain unchanged.
      </p>

      <hr style="border: 0; border-top: 1px solid #ddd;">

      <p>Best regards,</p>

      <strong style="color: #4f46e5;">
        The PrivacyGuard Team
      </strong>

      <p style="font-size: 12px; color: #777;">
        Your Privacy, Our Priority.
      </p>

    </div>
  `
    });

    res.status(200).json({
      message: "Email has sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      field: "general",
      message: "Password reset is cancelled due to some internal error",
    });
  }
});

app.post("/api/reset-password", async (req, res) => {

  try{

    const password = req.body.password;
  const resetToken = req.body.resetToken;

  if (
    typeof password !== "string" ||
    password.trim() === "" ||
    password.length < 8
  ) {
    return res.status(400).json({
      field: "password",
      message: "Please fill the password of atleast 8 characters",
    });
  } else if (typeof resetToken !== "string" || resetToken.trim() === "") {
    return res.status(400).json({
      field: "password",
      message: "Invalid Token",
    });
  }

  const hashToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const find_hashToken = await userModel.findOne({ resetTokenHash: hashToken });

  if (!find_hashToken) {
    return res.status(400).json({
      field: "password",
      message: "Invalid Token",
    });
  } else {
    const expiryTime = find_hashToken.resetTokenExpiry;

    if(!expiryTime || Number.isNaN(expiryTime.getTime())){
      return res.status(400).json({
        field:"password",
        message:"Token is Invalid"
      })
    }

    if (expiryTime.getTime() <= Date.now()) {
    return res.status(400).json({
    field: "password",
    message: "Token is expired",
  });
}


}

const hashUpdatePassword = await bcrypt.hash(password,12);

const update = await userModel.findOneAndUpdate(
  {_id:find_hashToken._id,
    resetTokenHash:hashToken,
    resetTokenExpiry:{
      $gt : new Date()
    }
  },
  {
  password:hashUpdatePassword,
  resetTokenHash:null,
  resetTokenExpiry:null

},
{new:true}
)

if(!update){
  return res.status(400).json({
    field:"password",
    message:"Token is Invalid"
  })
}

res.status(200).json({
  message:'Password is Updated Successfully.'
})

}

catch(error){
  res.status(500).json({
    field:"general",
    message:"Password updation failed"
  })

}
});

app.post("/api/analyze", authMiddleware, async (req, res) => {
  console.log("ANALYZE ROUTE VERSION 2");
  const name = req.body.name;
  const purpose = req.body.purpose;
  const permissions = req.body.permissions;
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      message: "Name is required to fill",
    });
  } else if (typeof purpose !== "string" || purpose.trim() === "") {
    return res.status(400).json({
      message: "Application purpose is required to fill",
    });
  } else if (
    Array.isArray(permissions) !== true ||
    !permissions.some(
      (permission) =>
        typeof permission === "string" && permission.trim() !== "",
    ) ||
    permissions.length === 0
  ) {
    return res.status(400).json({
      message: "Permission is required to submit",
    });
  } else {
    try {
      const response = await openrouter.chat.completions.create({
        model: "liquid/lfm-2.5-2.6b:free",
        messages: [
          {
            role: "system",
            content:
              "You are a professional AI privacy-permission analyzer. Analyze an application's requested permissions in relation to its stated purpose.For each requested permission, determine whether it is relevant and compatible with the application's stated purpose. Identify permissions that appear potentially unnecessary, excessive, or questionable based only on the information provided.Assess the potential privacy risk associated with each permission and provide a clear reason for your assessment. After analyzing the permissions individually, determine the application's overall permission compatibility and overall privacy risk.If the provided information is insufficient to make a reliable determination, do not guess or make assumptions. Clearly state that there is insufficient information and explain what cannot be determined.Provide the analysis in simple, clear, user-friendly language so that a non-technical user can easily understand it. Include an explanation of the main privacy concerns and a practical recommendation for the user.Do not make absolute claims that an application is 'safe' or 'malicious' based only on its stated purpose and requested permissions. Focus on permission-purpose compatibility and potential privacy risks.Return ONLY valid JSON that strictly follows the provided JSON schema.Do not return Markdown .Do not use headings, tables, bullet points, code fences, or any text outside the JSON object.",
          },

          {
            role: "user",
            content:
              "Application Name :" +
              req.body.name +
              "\n" +
              "Application Prpose :" +
              req.body.purpose +
              "\n " +
              "Application Permisson :" +
              req.body.permissions.join(", "),
          },
        ],

        response_format: {
          type: "json_schema",
          json_schema: {
            name: "privacy_guard_analysis",
            strict: true,

            schema: {
              type: "object",
              properties: {
                permissionAnalysis: {
                  type: "array",

                  items: {
                    type: "object",
                    properties: {
                      permission: {
                        type: "string",
                      },

                      compatibility: {
                        type: "string",
                        enum: [
                          "High compatibility",
                          "Medium compatibility",
                          "Low compatibility",
                          "Insufficient information",
                        ],
                      },

                      privacyRisk: {
                        type: "string",
                        enum: [
                          "High risk",
                          "Medium risk",
                          "Low risk",
                          "Insufficient information",
                        ],
                      },
                      explanation: {
                        type: "string",
                      },
                      recommendation: {
                        type: "string",
                      },
                    },
                    required: [
                      "permission",
                      "compatibility",
                      "privacyRisk",
                      "explanation",
                      "recommendation",
                    ],
                    additionalProperties: false,
                  },
                },

                overallAnalysis: {
                  type: "object",

                  properties: {
                    compatibility: {
                      type: "string",
                      enum: [
                        "High compatibility",
                        "Medium compatibility",
                        "Low compatibility",
                        "Insufficient information",
                      ],
                    },

                    privacyRisk: {
                      type: "string",
                      enum: [
                        "High risk",
                        "Medium risk",
                        "Low risk",
                        "Insufficient information",
                      ],
                    },
                    explanation: {
                      type: "string",
                    },
                    recommendation: {
                      type: "string",
                    },
                  },

                  required: [
                    "compatibility",
                    "privacyRisk",
                    "explanation",
                    "recommendation",
                  ],
                  additionalProperties: false,
                },
              },

              required: ["permissionAnalysis", "overallAnalysis"],

              additionalProperties: false,
            },
          },
        },
      });

      console.log("Full Ai Response");
      console.dir(response, { depth: null });

      const aiResponse = JSON.parse(response.choices[0].message.content);
      console.log("AI response type:", typeof aiResponse);
      console.log(aiResponse);

      const previous = await Application.findOne({
        name: req.body.name,
        userId: req.userId,
      }).sort({
        createdAt: -1,
      });

      console.log("Previous document:", previous);
      console.log("Previous exists:", !!previous);
      console.log("Current permissions:", permissions);
      console.log("Previous permissions:", previous?.permissions);

      const added = [];
      const removed = [];
      const unchanged = [];

      let saved_data;

      if (previous) {
        for (let i = 0; i < req.body.permissions.length; i++) {
          const result = previous.permissions.includes(req.body.permissions[i]);
          if (!result) {
            added.push(req.body.permissions[i]);
          }
        }

        for (let i = 0; i < previous.permissions.length; i++) {
          const result_remove = req.body.permissions.includes(
            previous.permissions[i],
          );
          if (!result_remove) {
            removed.push(previous.permissions[i]);
          } else {
            unchanged.push(previous.permissions[i]);
          }
        }

        console.log("userId being saved:", req.userId);

        saved_data = await Application.create({
          userId: req.userId,
          name: name,
          purpose: purpose,
          permissions: permissions,
          permissionAnalysis: aiResponse.permissionAnalysis,
          overallAnalysis: aiResponse.overallAnalysis,
          changes: {
            permissions: {
              added,
              removed,
              unchanged,
            },

            overall: {
              previousCompatibility: previous.overallAnalysis.compatibility,
              previousPrivacyRisk: previous.overallAnalysis.privacyRisk,

              currentCompatibility: aiResponse.overallAnalysis.compatibility,
              currentPrivacyRisk: aiResponse.overallAnalysis.privacyRisk,
            },
          },
        });
      } else {
        console.log("Entered else branch");
        saved_data = await Application.create({
          userId: req.userId,
          name: name,
          purpose: purpose,
          permissions: permissions,
          permissionAnalysis: aiResponse.permissionAnalysis,
          overallAnalysis: aiResponse.overallAnalysis,
        });
        console.log("First Saved:", saved_data);
      }

      res.status(200).json({
        message: "Successfully analyzed",
        id: saved_data._id,
      });
    } catch (error) {
      console.log("Error status :", error.status);
      console.log("Error message :", error.message);

      if (error.status === 429) {
        res.status(429).json({
          message: "AI request limit reached.Please try again later...",
        });
      } else if (error.status === 402) {
        res.status(402).json({
          message:
            "AI analysis is temporarily unavailable due to a service credit limit. Please try again later.",
        });
      } else {
        res.status(500).json({
          message: "Ai analysis failed",
        });
      }
    }
  }
});

app.get("/api/history", authMiddleware, async (req, res) => {
  try {
    const rerievedata = await Application.find({
      userId: req.userId,
    });

    res.status(200).json({
      message: "Data is retrieved successfully",
      read_data: rerievedata,
    });
  } catch (error) {
    res.status(500).json({
      message: "Data is not retrived",
    });
  }
});

app.get("/api/history/latest", authMiddleware, async (req, res) => {
  try {
    const latest = await Application.findOne({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      latest_data: latest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Data is not retrived",
    });
  }
});

app.get("/api/history/:app_id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.app_id;

    const app_id_data = await Application.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!app_id_data) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.status(200).json({
      message:
        "Data is retrieved successfully for this particular application id",
      id_data: app_id_data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Data is not retrived",
    });
  }
});

app.listen(port, () => {
  console.log(`App listen at ${port} `);
  console.log("Api key loaded :", Boolean(openrouter_api_key));
});
