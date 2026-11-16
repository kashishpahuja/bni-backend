
require("dotenv").config();

const mongoose = require("mongoose");
const Member = require("./models/Member");
const members = require("./data/member.json");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const formattedMembers = members.map((member, index) => ({
      legacyId: member.id,

      name: member.name || "",
      business: member.business || "",
      category: member.category || "",
      mobile: member.mobile || "",
      address: member.address || "",
      img: member.img || "",

      type: member.type || "",

      badge: Array.isArray(member.badge)
        ? member.badge.filter(Boolean)
        : member.badge
          ? [member.badge]
          : [],

      presentations:
        member.presentations ||
        member.Presentations ||
        "",

      display: {
        roster: member.display?.roster ?? true,
        directors: member.display?.directors ?? false,
        supporters: member.display?.supporters ?? false,
        founders: member.display?.founders ?? false,
        currentLt: member.display?.currentLt ?? false,
      },

      sortOrder: member.sortOrder ?? index,
      isActive: member.isActive ?? true,
    }));

    // Only run on an empty collection.
    await Member.insertMany(formattedMembers);

    console.log(`${formattedMembers.length} members imported successfully`);

  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
