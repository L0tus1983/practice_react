"use strict";

var http = require('http');
var express = require('express');
// viewsディレクトリの絶対パスを作成するために
// pathライブラリを使用
var path = require('path');
// ThirdParty body-parserの利用
// 送信された各要素を解析し、req.bodyオブジェクトに値を返してくれる
var bodyparser = require('body-parser');

// mongooseをExpressで利用できるようにする
var mongoose = require('mongoose');
// スキーマのインポート
// MongoDBからデータを取得するときもこれ↓
var Message = require('./schema/Message');

var fileUpload = require('express-fileupload');

var app = express();

mongoose.connect('mongodb://localhost:27017/chatapp', function (err) {
    if (err) {
        console.log(err);
    }else{
        console.log('successfully connected to MongoDB.');
    }
});

// express.staticによる静的ファイル配信設定
// 以下記述により、設定したパスから画像ファイルを配信できる
app.use("/image", express.static(path.join(__dirname, 'image')));

// app.useによるミドルウェアの設定
app.use(bodyparser())

// テンプレートエンジンとしてパグちゃんを設定する
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ルーティング
// app.get
// 第一引数にパスを指定している
app.get('/', function (req, res, next) {
    // 下記MongoDBのクエリ形式は、第一引数にオブジェクト形式の
    // クエリを設定して、最後の引数に結果を取得するための
    // コールバック関数を設定する形式となる
    // コールバック関数の第一引数はエラーオブジェクト、
    // 第二引数は結果が配列形式で格納されている
    Message.find({}, function(err, msgs){
    if(err) {throw err;}
    return res.render('index', {messages: msgs});
    });
});

// res.renderの第一引数にテンプレートファイルのファイル名
// 第二引数にテンプレートにはめ込みたい変数を、
// JSON形式{' ':' '}で指定

app.get('/update', function(req, res, next){
    return res.render('update');
});

app.post("/update", fileUpload() ,function(req, res, next){

    if (req.files && req.files.image) {
        req.files.image.mv('./image/' + req.files.image.name, function(err){
            if(err) throw err;
            var newMessage = new Message({
                username: req.body.username,
                message: req.body.message,
                image_path: '/image/' + req.files.image.name
            });
            newMessage.save((err) => {
                if(err) throw err;
                return res.redirect('/');
            });
        });
    } else {
        // スキーマにデータを格納する
        var newMessage = new Message({
        username: req.body.username,
        message: req.body.message
    });
        console.log(req.files.image);
        newMessage.save((err) => {
        if (err) {
            throw err;
        }
            return res.redirect("/");
        });
    }
})

var server = http.createServer(app);
server.listen('3000') ;