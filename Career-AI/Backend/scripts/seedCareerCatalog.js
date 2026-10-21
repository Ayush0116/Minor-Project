import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";

dotenv.config();

const qualificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const fieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    qualification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Qualification",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

fieldSchema.index({ qualification: 1, code: 1 }, { unique: true });

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: "technical" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
      required: true,
    },
    skills: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
          required: true,
        },
        estimatedHours: { type: Number, default: 10, min: 1 },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roleSchema.index({ field: 1, name: 1 }, { unique: true });

const Qualification =
  mongoose.models.Qualification ||
  mongoose.model("Qualification", qualificationSchema);

const Field =
  mongoose.models.Field ||
  mongoose.model("Field", fieldSchema);

const Skill =
  mongoose.models.Skill ||
  mongoose.model("Skill", skillSchema);

const TargetRole =
  mongoose.models.TargetRole ||
  mongoose.model("TargetRole", roleSchema);

const catalog = [
  {
    qualification: "B.Tech",
    qualificationCode: "BTECH",
    fields: [
      {
        name: "Computer Science & Engineering",
        code: "CSE",
        roles: [
          {
            name: "Full Stack Developer",
            skills: [
              ["HTML", 6], ["CSS", 8], ["JavaScript", 16],
              ["React.js", 18], ["Node.js", 14], ["Express.js", 10],
              ["MongoDB", 10], ["Git & GitHub", 5], ["Deployment", 8],
            ],
          },
          {
            name: "Frontend Developer",
            skills: [
              ["HTML", 6], ["CSS", 10], ["JavaScript", 18],
              ["React.js", 20], ["Responsive Design", 8],
              ["Git & GitHub", 5], ["Deployment", 6],
            ],
          },
          {
            name: "Backend Developer",
            skills: [
              ["Programming Fundamentals", 10], ["JavaScript", 12],
              ["Node.js", 14], ["Express.js", 10], ["REST APIs", 8],
              ["MongoDB", 10], ["Authentication", 8],
              ["Git & GitHub", 5], ["Deployment", 8],
            ],
          },
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Pandas", 10], ["Data Visualization", 12],
              ["Power BI", 12], ["Portfolio Projects", 12],
            ],
          },
          {
            name: "Data Scientist",
            skills: [
              ["Python", 18], ["Statistics", 16], ["SQL", 12],
              ["Pandas", 10], ["NumPy", 8], ["Machine Learning", 24],
              ["Data Visualization", 10], ["Portfolio Projects", 16],
            ],
          },
          {
            name: "AI/ML Engineer",
            skills: [
              ["Python", 16], ["Statistics", 12], ["Linear Algebra", 12],
              ["NumPy", 8], ["Pandas", 8], ["Machine Learning", 24],
              ["Deep Learning", 24], ["Git & GitHub", 5],
            ],
          },
        ],
      },
      {
        name: "Information Technology",
        code: "IT",
        roles: [
          {
            name: "Full Stack Developer",
            skills: [
              ["HTML", 6], ["CSS", 8], ["JavaScript", 16],
              ["React.js", 18], ["Node.js", 14], ["Express.js", 10],
              ["MongoDB", 10], ["Git & GitHub", 5], ["Deployment", 8],
            ],
          },
          {
            name: "Backend Developer",
            skills: [
              ["Programming Fundamentals", 10], ["JavaScript", 12],
              ["Node.js", 14], ["Express.js", 10], ["REST APIs", 8],
              ["MongoDB", 10], ["Authentication", 8],
              ["Git & GitHub", 5],
            ],
          },
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Pandas", 10], ["Power BI", 12],
              ["Data Visualization", 12],
            ],
          },
        ],
      },
      {
        name: "Electronics & Communication Engineering",
        code: "ECE",
        roles: [
          {
            name: "Embedded Systems Engineer",
            skills: [
              ["C Programming", 16], ["C++", 16], ["Digital Electronics", 12],
              ["Microcontrollers", 16], ["Embedded C", 16],
              ["Communication Protocols", 12], ["Git & GitHub", 5],
            ],
          },
          {
            name: "Software Developer",
            skills: [
              ["Programming Fundamentals", 12], ["C++", 16],
              ["Data Structures & Algorithms", 24], ["SQL", 10],
              ["Git & GitHub", 5], ["Projects", 16],
            ],
          },
        ],
      },
      {
        name: "Mechanical Engineering",
        code: "ME",
        roles: [
          {
            name: "CAD Design Engineer",
            skills: [
              ["Engineering Drawing", 12], ["AutoCAD", 20],
              ["SolidWorks", 24], ["3D Modeling", 16],
              ["Manufacturing Fundamentals", 12],
            ],
          },
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Power BI", 12],
              ["Data Visualization", 12],
            ],
          },
        ],
      },
      {
        name: "Civil Engineering",
        code: "CE",
        roles: [
          {
            name: "Civil Design Engineer",
            skills: [
              ["Engineering Drawing", 12], ["AutoCAD", 20],
              ["Structural Analysis", 20], ["Revit", 20],
              ["Project Planning", 12],
            ],
          },
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Power BI", 12],
            ],
          },
        ],
      },
    ],
  },

  {
    qualification: "BCA",
    qualificationCode: "BCA",
    fields: [
      {
        name: "Computer Applications",
        code: "CA",
        roles: [
          {
            name: "Frontend Developer",
            skills: [
              ["HTML", 6], ["CSS", 10], ["JavaScript", 18],
              ["React.js", 20], ["Responsive Design", 8],
              ["Git & GitHub", 5],
            ],
          },
          {
            name: "Full Stack Developer",
            skills: [
              ["HTML", 6], ["CSS", 8], ["JavaScript", 16],
              ["React.js", 18], ["Node.js", 14], ["Express.js", 10],
              ["MongoDB", 10], ["Git & GitHub", 5],
            ],
          },
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Pandas", 10],
              ["Power BI", 12],
            ],
          },
        ],
      },
    ],
  },

  {
    qualification: "MCA",
    qualificationCode: "MCA",
    fields: [
      {
        name: "Computer Applications",
        code: "CA",
        roles: [
          {
            name: "Software Developer",
            skills: [
              ["Programming Fundamentals", 12], ["Java", 18],
              ["Data Structures & Algorithms", 24], ["SQL", 12],
              ["REST APIs", 10], ["Git & GitHub", 5],
              ["Projects", 16],
            ],
          },
          {
            name: "Full Stack Developer",
            skills: [
              ["HTML", 6], ["CSS", 8], ["JavaScript", 16],
              ["React.js", 18], ["Node.js", 14], ["Express.js", 10],
              ["MongoDB", 10], ["Git & GitHub", 5],
            ],
          },
          {
            name: "AI/ML Engineer",
            skills: [
              ["Python", 16], ["Statistics", 12], ["Linear Algebra", 12],
              ["NumPy", 8], ["Pandas", 8], ["Machine Learning", 24],
              ["Deep Learning", 24],
            ],
          },
        ],
      },
    ],
  },

  {
    qualification: "B.Sc",
    qualificationCode: "BSC",
    fields: [
      {
        name: "Computer Science",
        code: "CS",
        roles: [
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Pandas", 10], ["Power BI", 12],
            ],
          },
          {
            name: "Data Scientist",
            skills: [
              ["Python", 18], ["Statistics", 16], ["SQL", 12],
              ["Pandas", 10], ["NumPy", 8], ["Machine Learning", 24],
              ["Portfolio Projects", 16],
            ],
          },
        ],
      },
      {
        name: "Mathematics",
        code: "MATH",
        roles: [
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Data Visualization", 12],
              ["Power BI", 12],
            ],
          },
          {
            name: "Data Scientist",
            skills: [
              ["Python", 18], ["Statistics", 16], ["Linear Algebra", 12],
              ["NumPy", 8], ["Pandas", 10], ["Machine Learning", 24],
            ],
          },
        ],
      },
    ],
  },

  {
    qualification: "B.Com",
    qualificationCode: "BCOM",
    fields: [
      {
        name: "Commerce",
        code: "COM",
        roles: [
          {
            name: "Financial Analyst",
            skills: [
              ["Excel", 16], ["Accounting Fundamentals", 14],
              ["Financial Statements", 18], ["Financial Modeling", 20],
              ["Financial Analysis", 16], ["SQL", 10],
              ["Data Visualization", 10], ["Presentation Skills", 6],
            ],
          },
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Power BI", 12],
              ["Data Visualization", 12],
            ],
          },
        ],
      },
      {
        name: "Accounting & Finance",
        code: "FIN",
        roles: [
          {
            name: "Financial Analyst",
            skills: [
              ["Excel", 16], ["Accounting Fundamentals", 14],
              ["Financial Statements", 18], ["Financial Modeling", 20],
              ["Financial Analysis", 16], ["SQL", 10],
              ["Presentation Skills", 6],
            ],
          },
          {
            name: "Accountant",
            skills: [
              ["Accounting Fundamentals", 18],
              ["Financial Statements", 16], ["Excel", 16],
              ["Taxation Fundamentals", 16], ["GST Fundamentals", 12],
              ["Accounting Software", 12],
            ],
          },
        ],
      },
    ],
  },

  {
    qualification: "MBA",
    qualificationCode: "MBA",
    fields: [
      {
        name: "Finance",
        code: "FIN",
        roles: [
          {
            name: "Financial Analyst",
            skills: [
              ["Excel", 16], ["Accounting Fundamentals", 14],
              ["Financial Statements", 18], ["Financial Modeling", 20],
              ["Financial Analysis", 16], ["SQL", 10],
              ["Presentation Skills", 6],
            ],
          },
        ],
      },
      {
        name: "Marketing",
        code: "MKT",
        roles: [
          {
            name: "Marketing Analyst",
            skills: [
              ["Excel", 10], ["SQL", 12], ["Statistics", 10],
              ["Data Visualization", 12], ["Digital Marketing", 16],
              ["Market Research", 14], ["Presentation Skills", 6],
            ],
          },
        ],
      },
      {
        name: "Business Analytics",
        code: "BA",
        roles: [
          {
            name: "Data Analyst",
            skills: [
              ["Excel", 10], ["SQL", 16], ["Statistics", 14],
              ["Python", 18], ["Power BI", 12],
              ["Data Visualization", 12],
            ],
          },
        ],
      },
    ],
  },
];

async function upsertQualification(item) {
  return Qualification.findOneAndUpdate(
    { code: item.qualificationCode },
    {
      $set: {
        name: item.qualification,
        code: item.qualificationCode,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function upsertField(item, qualificationId) {
  return Field.findOneAndUpdate(
    { qualification: qualificationId, code: item.code },
    {
      $set: {
        name: item.name,
        code: item.code,
        qualification: qualificationId,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function upsertSkill(name) {
  const category =
    /excel|accounting|financial|taxation|gst|marketing|market research|presentation/i.test(
      name
    )
      ? "business"
      : /python|sql|power bi|statistics|pandas|numpy|visualization|machine learning|deep learning|linear algebra/i.test(
          name
        )
      ? "data"
      : "technical";

  return Skill.findOneAndUpdate(
    { name },
    {
      $set: { name, category, isActive: true },
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function upsertRole(name, fieldId, skills) {
  const skillDocuments = [];

  for (const [skillName, estimatedHours] of skills) {
    const skill = await upsertSkill(skillName);

    skillDocuments.push({
      skill: skill._id,
      estimatedHours,
    });
  }

  return TargetRole.findOneAndUpdate(
    { name, field: fieldId },
    {
      $set: {
        name,
        field: fieldId,
        skills: skillDocuments,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function seedCatalog() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from Backend/.env");
  }

await connectDB();
  console.log("Connected to MongoDB:", mongoose.connection.name);

  let qualificationCount = 0;
  let fieldCount = 0;
  let roleCount = 0;
  const skillNames = new Set();

  for (const qualificationData of catalog) {
    const qualification = await upsertQualification(qualificationData);
    qualificationCount++;

    for (const fieldData of qualificationData.fields) {
      const field = await upsertField(fieldData, qualification._id);
      fieldCount++;

      for (const roleData of fieldData.roles) {
        await upsertRole(roleData.name, field._id, roleData.skills);
        roleCount++;

        for (const [skillName] of roleData.skills) {
          skillNames.add(skillName);
        }
      }
    }
  }

  console.log("\nCareer catalog seeded successfully.");
  console.log("Qualifications processed:", qualificationCount);
  console.log("Fields processed:", fieldCount);
  console.log("Role mappings processed:", roleCount);
  console.log("Unique skills processed:", skillNames.size);
  console.log("Collections:", "qualifications, fields, skills, targetroles");
}

seedCatalog()
  .catch((error) => {
    console.error("Career catalog seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
