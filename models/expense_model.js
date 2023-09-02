const mongoose = new require('mongoose');
const validate = new require('validator');

const expense_model = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Error passing user_id'],
    },
    name: {
      type: String,
      required: [true, 'The expense model must have the name'],
      validate: [validate.isAlpha, 'Name must only contain characters']
    },
    value: {
      type: Number,
      required: [true, 'The expense model must have the value expended'],
      min: [0, 'the expense must have to be more than 0']
    },
    category: {
      type: String,
      required: [true, 'The expense model must have the category'],
    },
    description: {
      type: String,
      required: [true, 'The expense model must have the description'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

expense_model.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

// virtuals
expense_model.virtual('dolarValue').get(function () {
  return (this.value / 4.77).toFixed(2);
})

//expense_model.pre(`event`, function() {});
//expense_model.post(`event`, function() {});

const Expense = mongoose.model('Expense', expense_model);

module.exports = Expense;
