import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const feeConfigurationSchema = new Schema({
  id:  String,
  locale: String,
  entity:   String,
  entityProperty: String,
  fee_flat: Number,
  fee_percentage_value: Number,
});

const feeConfigurationModel = model('FeeConfiguration', userSchema);

export default feeConfigurationModel;
