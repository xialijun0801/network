var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CodingSchema = new Schema(
{
	creator:{ type:Schema.Types.ObjectId, ref: 'User'},
	content: String,
	language: String,
	created:{ type: Date, default: Date.now}
});

module.exports = mongoose.model('Coding', CodingSchema);