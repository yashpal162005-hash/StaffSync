import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User, Announcement, Training, Leave, Attendance } from "./models.js";

dotenv.config();

export async function seedDatabase() {
  try {
    const hrExists = await User.findOne({ email: "hr@staffsync.com" });
    if (hrExists) {
      console.log("Database already seeded with demo accounts.");
      return;
    }

    console.log("Seeding initial demo accounts and data...");

    const passwordHash = await bcrypt.hash("password123", 12);

    const hrUser = await User.create({
      name: "Eleanor Vance",
      email: "hr@staffsync.com",
      password: passwordHash,
      role: "hr",
      department: "Human Resources",
      jobTitle: "Head of People & Culture",
      phone: "+1 (555) 019-2834"
    });

    const managerUser = await User.create({
      name: "Marcus Sterling",
      email: "manager@staffsync.com",
      password: passwordHash,
      role: "manager",
      department: "Engineering",
      jobTitle: "Engineering Director",
      phone: "+1 (555) 018-9921"
    });

    const employeeUser = await User.create({
      name: "Aanya Sharma",
      email: "employee@staffsync.com",
      password: passwordHash,
      role: "employee",
      department: "Engineering",
      jobTitle: "Senior Frontend Engineer",
      phone: "+1 (555) 014-5510"
    });

    // Sample announcements
    await Announcement.create([
      {
        title: "Welcome to StaffSync 2026",
        body: "We have upgraded our workspace and HR platform. Explore company announcements, mark attendance, request time off, and access professional training programs.",
        author: hrUser._id
      },
      {
        title: "Annual Hackathon & Innovation Day",
        body: "Registration for the upcoming Q4 Innovation Sprint is now open. Submit your team proposals through the engineering portal before Friday.",
        author: hrUser._id
      }
    ]);

    // Sample training sessions
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const nextMonth = new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    await Training.create([
      {
        title: "Scalable Microservices with Node.js & Docker",
        description: "Hands-on workshop covering microservice patterns, container orchestration, and CI/CD pipelines.",
        date: nextWeek,
        duration: "2 hours",
        createdBy: managerUser._id
      },
      {
        title: "Modern Leadership & Inclusive Team Culture",
        description: "A leadership masterclass focusing on empathy, coaching, effective delegation, and active listening.",
        date: nextMonth,
        duration: "1.5 hours",
        createdBy: hrUser._id
      }
    ]);

    // Sample attendance
    const todayStr = today.toISOString().slice(0, 10);
    await Attendance.create({
      user: employeeUser._id,
      date: todayStr,
      checkIn: new Date(today.setHours(9, 15, 0, 0)),
      status: "present"
    });

    // Sample leave request
    await Leave.create({
      user: employeeUser._id,
      leaveType: "Annual",
      startDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      reason: "Family vacation and annual travel.",
      status: "pending"
    });

    console.log("Demo seed successfully completed!");
  } catch (err) {
    console.error("Error during seed:", err);
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/staffsync")
    .then(async () => {
      await seedDatabase();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
