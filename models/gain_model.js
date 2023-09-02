const mongoose = new require('mongoose');

const gain_model = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'The gain model must have the name'],
    },
    value: {
      type: Number,
      required: [true, 'The gain model must have the value expended'],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Error passing user_id'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

gain_model.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

const Gain = mongoose.model('Gain', gain_model);

module.exports = Gain;
