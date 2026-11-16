const express = require("express");
const Member = require("../models/Member");
const protect = require("../middleware/auth");
const deleteMemberImage = require("../utils/deleteMemberImage");
const router = express.Router();

// PUBLIC: Get members for website sections
// PUBLIC: Get members for website sections
router.get("/", async (req, res) => {
  try {
    const {
      section = "roster",
      category,
      search,
    } = req.query;

    const allowedSections = [
      "roster",
      "directors",
      "supporters",
      "founders",
      "currentLt",
    ];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section",
      });
    }

    const filter = {
      isActive: true,
      [`display.${section}`]: true,
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    // ✅ Fix: Only process search if it is provided and is a non-empty string
    if (search?.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { name: regex },
        { business: regex },
        { category: regex },
        { mobile: regex },
      ];
    }

    const members = await Member.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// router.get("/", async (req, res) => {
//   try {
//     const {
//       section = "roster",
//       category,
//       search,
//     } = req.query;

//     const allowedSections = [
//       "roster",
//       "directors",
//       "supporters",
//       "founders",
//       "currentLt",
//     ];

//     if (!allowedSections.includes(section)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid section",
//       });
//     }

//     const filter = {
//       isActive: true,
//       [`display.${section}`]: true,
//     };

//     if (category && category !== "All") {
//       filter.category = category;
//     }

//     const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//     if (search?.trim()) {
// const regex = new RegExp(escapedSearch, "i");

//       filter.$or = [
//         { name: regex },
//         { business: regex },
//         { category: regex },
//         { mobile: regex },
//       ];
//     }

//     const members = await Member.find(filter)
//       .sort({ sortOrder: 1, name: 1 })
//       .lean();

//     res.json({
//       success: true,
//       count: members.length,
//       data: members,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// PUBLIC: Get unique categories for roster filter
router.get("/categories", async (req, res) => {
  try {
    const categories = await Member.distinct("category", {
      isActive: true,
      "display.roster": true,
      category: { $nin: ["", null] },
    });

    res.json({
      success: true,
      data: categories.sort((a, b) => a.localeCompare(b)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN: Get all records, including inactive ones
router.get("/admin/all", protect, async (req, res) => {
  try {
    const members = await Member.find()
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN: Get one member
router.get("/admin/:id", protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN: Create member
router.post("/", protect, async (req, res) => {
  try {
    const member = await Member.create(req.body);

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: member,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN: Update member
router.put("/:id", protect, async (req, res) => {
  try {
    const existingMember = await Member.findById(req.params.id);

    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const oldImage = existingMember.img;
    const newImage = req.body.img;

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    // Delete previous image only if a different image was saved successfully
    if (
      newImage &&
      oldImage &&
      newImage !== oldImage
    ) {
      await deleteMemberImage(oldImage);
    }

    res.json({
      success: true,
      message: "Member updated successfully",
      data: member,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});



// ADMIN: Delete member
router.delete("/:id", protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Delete database record first
    await Member.findByIdAndDelete(req.params.id);

    // Then delete the member's uploaded image
    await deleteMemberImage(member.img);

    res.json({
      success: true,
      message: "Member and associated image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;