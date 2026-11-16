const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    legacyId: {
      type: Number,
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    business: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    mobile: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    // Example: /uploads/member-123.webp
    img: {
      type: String,
      default: "",
    },

    badge: {
      type: [String],
      default: [],
    },
    type: {
  type: String,
  default: "",
},
    presentations: {
      type: String,
      default: "",
    },

    // Controls where this member appears
    display: {
      roster: { type: Boolean, default: true },
      directors: { type: Boolean, default: false },
      supporters: { type: Boolean, default: false },
      founders: { type: Boolean, default: false },
      currentLt: { type: Boolean, default: false },
    },

    // Fields used by the Directors section
    director: {
      type: {
        type: String,
        default: "",
      },

      tagline: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },
    },

    // Used for Founders / Previous LT / Current LT
    leadershipType: {
      type: String,
      default: "",
    },

    // Optional ordering inside each section
    sortOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },


  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);