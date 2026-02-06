/**
 * Seed script: adds 5 test lawyers (and their user accounts) to the database.
 * Run from Backend folder: node scripts/seedLawyers.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserModel from "../models/User.js";
import LawyerModel from "../models/Lawyer.js";

dotenv.config();

const TEST_PASSWORD = "test1234";

const lawyerUsers = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@legalconnect.test",
    mobile: "+91 9876512340",
    role: "lawyer",
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma@legalconnect.test",
    mobile: "+91 9876512341",
    role: "lawyer",
  },
  {
    name: "Anita Desai",
    email: "anita.desai@legalconnect.test",
    mobile: "+91 9876512342",
    role: "lawyer",
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@legalconnect.test",
    mobile: "+91 9876512343",
    role: "lawyer",
  },
  {
    name: "Meera Krishnan",
    email: "meera.krishnan@legalconnect.test",
    mobile: "+91 9876512344",
    role: "lawyer",
  },
];

const lawyerProfiles = [
  {
    practiceAreas: ["Family Law", "Housing & Tenants Rights"],
    serviceTypes: ["Pro Bono", "Low Cost"],
    education: [{ institution: "NLU Delhi", degree: "LL.B.", graduationYear: 2015 }],
    languages: ["English", "Hindi"],
    officeAddress: {
      street: "12 Legal Lane",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
      coordinates: { latitude: 19.076, longitude: 72.8777 },
    },
    consultationFee: 0,
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
      { day: "Friday", startTime: "09:00", endTime: "13:00" },
    ],
    isVerified: true,
  },
  {
    practiceAreas: ["Criminal Defense", "Civil Rights"],
    serviceTypes: ["Pro Bono", "Sliding Scale"],
    education: [{ institution: "NALSAR Hyderabad", degree: "LL.B.", graduationYear: 2012 }],
    languages: ["English", "Hindi", "Marathi"],
    officeAddress: {
      street: "45 Court Road",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001",
      country: "India",
      coordinates: { latitude: 18.5204, longitude: 73.8567 },
    },
    consultationFee: 500,
    availability: [
      { day: "Tuesday", startTime: "10:00", endTime: "18:00" },
      { day: "Thursday", startTime: "10:00", endTime: "18:00" },
    ],
    isVerified: true,
  },
  {
    practiceAreas: ["Employment Law", "Consumer Protection"],
    serviceTypes: ["Low Cost", "Standard Rates"],
    education: [
      { institution: "ILS Pune", degree: "LL.B.", graduationYear: 2018 },
      { institution: "Symbiosis", degree: "LL.M. Labour Law", graduationYear: 2020 },
    ],
    languages: ["English", "Hindi"],
    officeAddress: {
      street: "7 Business Park",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
    },
    consultationFee: 1000,
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
      { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
      { day: "Thursday", startTime: "09:00", endTime: "17:00" },
      { day: "Friday", startTime: "09:00", endTime: "15:00" },
    ],
    isVerified: true,
  },
  {
    practiceAreas: ["Immigration", "Civil Rights"],
    serviceTypes: ["Pro Bono", "Low Cost", "Sliding Scale"],
    education: [{ institution: "NUJS Kolkata", degree: "LL.B.", graduationYear: 2014 }],
    languages: ["English", "Hindi", "Bengali"],
    officeAddress: {
      street: "22 Embassy Row",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India",
      coordinates: { latitude: 28.6139, longitude: 77.209 },
    },
    consultationFee: 0,
    availability: [
      { day: "Monday", startTime: "10:00", endTime: "16:00" },
      { day: "Thursday", startTime: "10:00", endTime: "16:00" },
    ],
    isVerified: true,
  },
  {
    practiceAreas: ["Family Law", "Consumer Protection", "Other"],
    serviceTypes: ["Pro Bono", "Low Cost"],
    education: [{ institution: "GLC Mumbai", degree: "LL.B.", graduationYear: 2016 }],
    languages: ["English", "Hindi", "Tamil"],
    officeAddress: {
      street: "3 Marina Plaza",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600001",
      country: "India",
      coordinates: { latitude: 13.0827, longitude: 80.2707 },
    },
    consultationFee: 250,
    availability: [
      { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
      { day: "Friday", startTime: "09:00", endTime: "17:00" },
      { day: "Saturday", startTime: "09:00", endTime: "13:00" },
    ],
    isVerified: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: "legalconnect" });
    console.log("Connected to MongoDB (legalconnect).");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }

  try {
    const createdUserIds = [];

    for (let i = 0; i < lawyerUsers.length; i++) {
      const u = lawyerUsers[i];
      let user = await UserModel.findOne({ email: u.email });
      if (!user) {
        user = await UserModel.create({
          ...u,
          password: TEST_PASSWORD,
        });
        console.log(`Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
      createdUserIds.push(user._id);
    }

    for (let i = 0; i < lawyerProfiles.length; i++) {
      const existing = await LawyerModel.findOne({ user: createdUserIds[i] });
      if (existing) {
        console.log(`Lawyer profile already exists for ${lawyerUsers[i].name}, skipping.`);
        continue;
      }
      await LawyerModel.create({
        user: createdUserIds[i],
        ...lawyerProfiles[i],
      });
      console.log(`Created lawyer profile: ${lawyerUsers[i].name}`);
    }

    console.log("\nDone. 5 test lawyers are ready. You can log in with:");
    lawyerUsers.forEach((u) => console.log(`  ${u.email} / ${TEST_PASSWORD}`));
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

seed();
