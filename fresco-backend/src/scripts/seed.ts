import { webcrypto } from "node:crypto";
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = webcrypto;
}

import { connectDatabase, disconnectDatabase } from "../lib/database.js";
import { CategoryModel } from "../models/category.model.js";
import { GarmentModel } from "../models/garment.model.js";
import { ServiceModel } from "../models/service.model.js";
import { PricingModel } from "../models/pricing.model.js";
import { UserModel } from "../models/user.model.js";
import { AddressModel } from "../models/address.model.js";
import { hashPassword } from "../utils/password.js";

async function seed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await connectDatabase();

    console.log("🧹 Clearing old data (except users with specific ids)...");
    await CategoryModel.deleteMany({});
    await GarmentModel.deleteMany({});
    await ServiceModel.deleteMany({});
    await PricingModel.deleteMany({});
    await UserModel.deleteMany({
      $or: [
        { email: { $in: ["customer@fresco.com", "partner@fresco.com", "admin@fresco.com"] } },
        { phone: { $in: ["+919876543210", "+919876543211", "+919876543212"] } },
      ],
    });

    console.log("📁 Creating Categories...");
    const categoriesData = [
      { name: "men", description: "Men's everyday & formal wear", icon: "man-outline", displayOrder: 1 },
      { name: "women", description: "Women's casual, ethnic & formal wear", icon: "woman-outline", displayOrder: 2 },
      { name: "kids", description: "Kids' gentle garments & uniforms", icon: "happy-outline", displayOrder: 3 },
      { name: "home", description: "Bedding, curtains & home linens", icon: "bed-outline", displayOrder: 4 },
    ];
    const createdCategories = await CategoryModel.insertMany(categoriesData);
    const catMap = new Map(createdCategories.map((c) => [c.name, c._id]));

    console.log("🧺 Creating Services...");
    const servicesData = [
      { name: "wash & fold", description: "Gentle wash, machine dried and neatly folded", icon: "water-outline", displayOrder: 1 },
      { name: "wash & iron", description: "Full wash cycle with crisp steam ironing", icon: "shirt-outline", displayOrder: 2 },
      { name: "steam iron", description: "High-pressure temperature-controlled steam pressing", icon: "flame-outline", displayOrder: 3 },
      { name: "dry clean", description: "Premium eco-friendly solvent dry cleaning & pressing", icon: "sparkles-outline", displayOrder: 4 },
    ];
    const createdServices = await ServiceModel.insertMany(servicesData);
    const srvMap = new Map(createdServices.map((s) => [s.name, s._id]));

    console.log("👔 Creating Garments...");
    const garmentsList = [
      // Men
      { categoryId: catMap.get("men"), name: "shirt", description: "Formal / Casual Shirt", icon: "shirt-outline", displayOrder: 1 },
      { categoryId: catMap.get("men"), name: "t-shirt", description: "Round neck / Polo T-Shirt", icon: "shirt-outline", displayOrder: 2 },
      { categoryId: catMap.get("men"), name: "trousers", description: "Formal / Casual Trousers / Chinos", icon: "pants-outline", displayOrder: 3 },
      { categoryId: catMap.get("men"), name: "jeans", description: "Denim Jeans", icon: "pants-outline", displayOrder: 4 },
      { categoryId: catMap.get("men"), name: "suit 2pc", description: "Blazer and Trouser set", icon: "briefcase-outline", displayOrder: 5 },
      { categoryId: catMap.get("men"), name: "kurta", description: "Men's Kurta / Pyjama", icon: "shirt-outline", displayOrder: 6 },
      { categoryId: catMap.get("men"), name: "jacket", description: "Winter / Leather / Denim Jacket", icon: "snow-outline", displayOrder: 7 },

      // Women
      { categoryId: catMap.get("women"), name: "saree", description: "Cotton / Silk / Georgette Saree", icon: "woman-outline", displayOrder: 1 },
      { categoryId: catMap.get("women"), name: "kurti", description: "Women's Kurti / Top", icon: "woman-outline", displayOrder: 2 },
      { categoryId: catMap.get("women"), name: "dress", description: "One-piece Dress / Gown", icon: "woman-outline", displayOrder: 3 },
      { categoryId: catMap.get("women"), name: "jeans", description: "Women's Jeans", icon: "pants-outline", displayOrder: 4 },
      { categoryId: catMap.get("women"), name: "salwar suit", description: "Salwar Kameez with Dupatta", icon: "woman-outline", displayOrder: 5 },
      { categoryId: catMap.get("women"), name: "jacket", description: "Women's Jacket / Overcoat", icon: "snow-outline", displayOrder: 6 },

      // Kids
      { categoryId: catMap.get("kids"), name: "t-shirt", description: "Kids' T-Shirt", icon: "shirt-outline", displayOrder: 1 },
      { categoryId: catMap.get("kids"), name: "shorts", description: "Kids' Shorts / Skirt", icon: "pants-outline", displayOrder: 2 },
      { categoryId: catMap.get("kids"), name: "school uniform", description: "School Uniform Set", icon: "school-outline", displayOrder: 3 },
      { categoryId: catMap.get("kids"), name: "frock", description: "Kids' Party Frock / Dress", icon: "heart-outline", displayOrder: 4 },

      // Home
      { categoryId: catMap.get("home"), name: "bedsheet single", description: "Single Bedsheet + 1 Pillow cover", icon: "bed-outline", displayOrder: 1 },
      { categoryId: catMap.get("home"), name: "bedsheet double", description: "Double Bedsheet + 2 Pillow covers", icon: "bed-outline", displayOrder: 2 },
      { categoryId: catMap.get("home"), name: "blanket", description: "Single / Double Quilt or Blanket", icon: "bed-outline", displayOrder: 3 },
      { categoryId: catMap.get("home"), name: "curtain", description: "Window / Door Curtain per panel", icon: "grid-outline", displayOrder: 4 },
      { categoryId: catMap.get("home"), name: "towel", description: "Large Bath Towel", icon: "water-outline", displayOrder: 5 },
    ];
    const createdGarments = await GarmentModel.insertMany(garmentsList);

    console.log("💰 Creating Pricing Matrix...");
    // Base price tiers for services
    const serviceMultiplier: Record<string, number> = {
      "wash & fold": 1.0,
      "steam iron": 0.7,
      "wash & iron": 1.4,
      "dry clean": 2.5,
    };

    const garmentBasePrice: Record<string, number> = {
      "shirt": 40,
      "t-shirt": 35,
      "trousers": 45,
      "jeans": 50,
      "suit 2pc": 150,
      "kurta": 45,
      "jacket": 120,
      "saree": 90,
      "kurti": 45,
      "dress": 80,
      "salwar suit": 85,
      "shorts": 30,
      "school uniform": 55,
      "frock": 50,
      "bedsheet single": 70,
      "bedsheet double": 110,
      "blanket": 180,
      "curtain": 95,
      "towel": 35,
    };

    const pricings = [];
    for (const g of createdGarments) {
      const base = garmentBasePrice[g.name] || 50;
      for (const s of createdServices) {
        const mult = serviceMultiplier[s.name] || 1.0;
        const calculatedPrice = Math.round(base * mult);
        pricings.push({
          garmentId: g._id,
          serviceId: s._id,
          price: Math.max(calculatedPrice, 15),
          currency: "INR",
          isActive: true,
        });
      }
    }
    await PricingModel.insertMany(pricings);

    console.log("👤 Creating Demo Users...");
    const hashedPassword = await hashPassword("Password@123");

    const customer = await UserModel.create({
      firstName: "Rahul",
      lastName: "Sharma",
      email: "customer@fresco.com",
      phone: "+919876543210",
      password: hashedPassword,
      role: "CUSTOMER",
      status: "ACTIVE",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    const partner = await UserModel.create({
      firstName: "Amit",
      lastName: "Kumar",
      email: "partner@fresco.com",
      phone: "+919876543211",
      password: hashedPassword,
      role: "DELIVERY_PARTNER",
      status: "ACTIVE",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    const admin = await UserModel.create({
      firstName: "Admin",
      lastName: "Fresco",
      email: "admin@fresco.com",
      phone: "+919876543212",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    console.log("🏠 Creating Default Address for Demo Customer...");
    await AddressModel.deleteMany({ userId: customer._id });
    await AddressModel.create({
      userId: customer._id,
      label: "HOME",
      fullName: "Rahul Sharma",
      phone: "+919876543210",
      addressLine1: "Flat 402, Sunshine Heights",
      addressLine2: "MG Road, Sector 14",
      landmark: "Opposite City Mall",
      city: "Gurugram",
      state: "Haryana",
      postalCode: "122001",
      country: "India",
      latitude: 28.4595,
      longitude: 77.0266,
      isDefault: true,
    });

    console.log("\n=======================================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=======================================================");
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Services:   ${createdServices.length}`);
    console.log(`Garments:   ${createdGarments.length}`);
    console.log(`Pricings:   ${pricings.length}`);
    console.log("\n🔑 DEMO ACCOUNTS READY:");
    console.log("  1) Customer:");
    console.log("     Email:    customer@fresco.com");
    console.log("     Password: Password@123");
    console.log("  2) Delivery Partner:");
    console.log("     Email:    partner@fresco.com");
    console.log("     Password: Password@123");
    console.log("  3) Admin:");
    console.log("     Email:    admin@fresco.com");
    console.log("     Password: Password@123");
    console.log("=======================================================\n");

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

void seed();
