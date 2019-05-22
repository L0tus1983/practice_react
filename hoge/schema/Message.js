var mongoose = require('mongoose');

// ここでMessageというスキーマを生成している
var Message = mongoose.Schema({
    username: String,
    message: String,
    date: {type: Date, default: new Date()},
    image_path: String
});
// 外部利用設定
module.exports = mongoose.model('Message', Message);