const mongoose = require("mongoose");

const shedSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    ownerId: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    fuelTypes: {
      petrol92: {
        type: Boolean,
        default: false,
      },

      petrol95: {
        type: Boolean,
        default: false,
      },

      diesel: {
        type: Boolean,
        default: false,
      },

      superDiesel: {
        type: Boolean,
        default: false,
      },
    },

    queueStatus: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// IMPORTANT
shedSchema.index({ location: "2dsphere" });

shedSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.shedId = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Shed", shedSchema);