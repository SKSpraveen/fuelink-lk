const mongoose = require("mongoose");

const queueSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    shedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shed",
      required: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

queueSessionSchema.index({ location: "2dsphere" });

queueSessionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("QueueSession", queueSessionSchema);
