"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var venom = require('venom-bot');
var mysql = require('mysql');
var express = require('express');
var app = express();
var path = require("path");
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var mime = require("mime-types");
var options = {
    key: fs.readFileSync('cert/server.key'),
    cert: fs.readFileSync('cert/server.crt')
};
var new_server = https.createServer(options, app);
var io = require('socket.io')(new_server, {
    cors: {
        origin: '*'
    },
    maxHttpBufferSize: 10000000000,
    maxBufferSize: 10000000000
});
app.use('/arquivos', express.static('arquivos'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var globalClient = undefined;
var mensagem_bot = '';
var contatos = [];
var atendimento = [];
var id_cliente = 4;
var connection;
var session_id;
var PORT;
var wa_id;
function incia_conexao() {
    connection = mysql.createConnection({
        host: "servidor.i9devgroup.com",
        user: "root",
        password: "99659819aA",
        database: "banco_chat",
        charset: "utf8mb4"
    });
    connection.connect(function (err) {
        if (err) {
            console.log('erro');
            setTimeout(incia_conexao, 2000);
        }
        else {
            console.log('conectado');
        }
    });
    connection.on('error', function (err) {
        // console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            incia_conexao();
            console.log("PROTOCOL_CONNECTION_LOST"); // lost due to either server restart, or a
        }
        else {
            console.log(err); // connnection idle timeout (the wait_timeout
            throw err;
            // server variable configures this)
        }
    });
}
incia_conexao();
var sql = "SELECT * FROM clientes WHERE id = '" + id_cliente + "'";
connection.query(sql, function (err2, results) {
    var _this = this;
    if (err2) {
        console.log('session_is nao encontrado');
    }
    var session_id = 'SessionID-' + id_cliente;
    var wa_id = results[0].id_server;
    var PORT = results[0].porta;
    console.log('--------------CLIENTE-----------------');
    console.log('ID da essao: ' + session_id);
    console.log('Porta: ' + PORT);
    // IMPORTA CERTIFICADO
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.json());
    // INICIA O SERVIDOR COM A PORTA
    new_server.listen(PORT, function () {
        console.log('--------------SERVIDOR-----------------');
        console.log("\n\u2022 Server online porta: " + PORT + "!");
    });
    app.get('/teste_online', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (req.query.contato != null && req.query.mensagem != null) {
                envia_mensagem(req.query.contato, req.query.mensagem, '', '', 'txt');
                return [2 /*return*/, res.send(true)];
            }
            else {
                return [2 /*return*/, res.send(false)];
            }
            return [2 /*return*/];
        });
    }); });
    app.post('/stop', function (req, res) {
        if (globalClient != undefined) {
            globalClient.close();
            globalClient = undefined;
            res.send(true);
        }
        else {
            res.send(false);
        }
    });
    app.post('/consulta_contato', function (req, res) {
        var contato_atendimento = "SELECT * FROM contatos WHERE id_server = '" + id_cliente + "' AND telefone = '" + req.body.telefone + "' LIMIT 1";
        connection.query(contato_atendimento, function (err, rows, fields) {
            res.json(rows);
        });
    });
    app.post('/salvar_contato', function (req, res) {
        console.log('entrou');
        globalClient.checkNumberStatus(req.body.n_whatsapp + '@c.us').then(function (resposta) {
            console.log(resposta)

            if (resposta.status != 404) {
                var contato_atendimento = "SELECT * FROM contatos WHERE id_server = '" + id_cliente + "' AND telefone = '" + resposta.id.user + "' LIMIT 1";
                connection.query(contato_atendimento, function (err, rows, fields) {
                    if (rows.length > 0) {
                        // globalClient.getProfilePicFromServer(resposta.id._serialized).then(function (img) {
                            img = undefined;
                            if (img != undefined) {
                                var img = img;
                            }
                            else {
                                img = '';
                            }
                            var sql = "UPDATE contatos SET nome = '" + req.body.nome + "', telefone = '" + resposta.id.user + "', email = '" + req.body.email + "', empresa = '" + req.body.empresa + "', server = '" + resposta.id.server + "', img = '" + img + "', obs = '" + req.body.observacao + "' WHERE id = '" + rows[0]['id'] + "' AND id_server = '" + id_cliente + "'";
                            connection.query(sql, function (err, result_msng) {
                                if (!err) {
                                    var contato_atendimento2 = "SELECT * FROM contatos WHERE id = '" + rows[0]['id'] + "'";
                                    connection.query(contato_atendimento2, function (err, add_contato, fields) {
                                        var saida = {
                                            contato_id: resposta.id.user
                                        };
                                        io.emit('contato_remove', saida);
                                        io.emit('contato_add', add_contato);
                                        res.json(true);
                                    });
                                }
                            });
                        // });
                    }
                    else {
                        res.json('un_exist');
                    }
                });
            }
            else {
                res.json('un_exist');
            }
        })["catch"](function (e) {
            res.json('un_exist');
            console.log(e); // "Ah, não!"
        });
    });
    app.post('/add_contato', function (req, res) {
        console.log('entrou');
        globalClient.checkNumberStatus(req.body.n_whatsapp + '@c.us').then(function (resposta) {
            console.log(resposta)
            if (resposta.status != 404) {
                var contato_atendimento = "SELECT * FROM contatos WHERE id_server = '" + id_cliente + "' AND telefone = '" + resposta.id.user + "'";
                connection.query(contato_atendimento, function (err, rows, fields) {
                    if (rows.length > 0) {
                        res.json('exist');
                    }
                    else {
                        // globalClient.getProfilePicFromServer(resposta.id._serialized).then(function (img) {
                            img = undefined;
                            if (img != undefined) {
                                var img = img;
                            }
                            else {
                                img = '';
                            }
                            var sql = "INSERT INTO contatos (`nome`, `telefone`, `email`, `empresa`, `server`, `id_server`, `img`, `obs`) VALUES ?";
                            var values = [
                                [req.body.nome, resposta.id.user, req.body.email, req.body.empresa, resposta.id.server, id_cliente, img, req.body.observacao]
                            ];
                            connection.query(sql, [values], function (err, result_msng) {
                                if (!err) {
                                    var contato_atendimento2 = "SELECT * FROM contatos WHERE id = '" + result_msng.insertId + "'";
                                    connection.query(contato_atendimento2, function (err, add_contato, fields) {
                                        io.emit('contato_add', add_contato);
                                        res.json(true);
                                    });
                                }
                            });
                        // });
                    }
                });
            }
            else {
                res.json('un_exist');
            }
        })["catch"](function (e) {
            res.json('un_exist');
            console.log(e); // "Ah, não!"
        });
    });
    app.post('/restart', function (req, res) {
        globalClient.restartService();
        res.send(true);
    });
    app.get('/qr_code', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // var teste = '<script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>';
            //     teste += '<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.0/socket.io.js"></script>';
            //     teste += '<script>const socket = io("http://localhost:'+PORT+'");</script> ';
            //     teste += '<script>socket.on("qr_code", function(message){ console.log(message)})';
            res.sendFile(path.join(__dirname + '/qr_code/index.html'));
            return [2 /*return*/];
        });
    }); });

    app.post('/start', function (req, res) {
        if (globalClient == undefined) {

            // venom.create({
            //     session: session_id, //name of session
            //     multidevice: false, // for version not multidevice use false.(default: true)
            // })
            // .then((client) => start(client))
            // .catch((erro) => {
            //   console.log(erro);
            // });

            venom.create(
             session_id,
            // session_id, //Pass the name of the client you want to start the bot
            //catchQR
            function (base64Qrimg, asciiQR, attempts, urlCode) {
                //   console.log('Number of attempts to read the qrcode: ', attempts);
                console.log('Terminal qrcode: ', asciiQR);
                var sair = {
                    asciiQR: asciiQR,
                    base64Qrimg: base64Qrimg,
                    attempts: attempts,
                    urlCode: urlCode
                };
                io.emit('qr_code', base64Qrimg);
                //   console.log('base64 image string qrcode: ', base64Qrimg);
                //   console.log('urlCode (data-ref): ', urlCode);
                // var timestamp = new Date().getTime();
                // var sql = `UPDATE qr_code SET data = '${timestamp}', qr_code = '${urlCode}' WHERE session_id = '${session_id}'`;
                // connection.query(sql);
            }, 
            // statusFind
            function (statusSession, session) {
                console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
                //Create session wss return "serverClose" case server for close
                console.log('Session name: ', session);
            }, 
            // options
            {
                multidevice: true,
                // folderNameToken: 'tokens',
                mkdirFolderToken: '',
                headless: true,
                devtools: false,
                useChrome: true,
                debug: false,
                logQR: true,
                browserWS: '',
                browserArgs: [''],
                puppeteerOptions: { args: ['--no-sandbox'] },
                disableSpins: true,
                disableWelcome: true,
                updatesLog: true,
                autoClose: 0,
                createPathFileToken: false
            })
                .then(function (client) {
                start(client);
            })["catch"](function (erro) {
                console.log(erro);
            });


            res.send(true);



        }
        else {
            res.send(false);
        }
    });


function startManual(){
    venom.create(
        session_id,
       // session_id, //Pass the name of the client you want to start the bot
       //catchQR
       function (base64Qrimg, asciiQR, attempts, urlCode) {
           //   console.log('Number of attempts to read the qrcode: ', attempts);
           console.log('Terminal qrcode: ', asciiQR);
           var sair = {
               asciiQR: asciiQR,
               base64Qrimg: base64Qrimg,
               attempts: attempts,
               urlCode: urlCode
           };
           io.emit('qr_code', base64Qrimg);
           //   console.log('base64 image string qrcode: ', base64Qrimg);
           //   console.log('urlCode (data-ref): ', urlCode);
           // var timestamp = new Date().getTime();
           // var sql = `UPDATE qr_code SET data = '${timestamp}', qr_code = '${urlCode}' WHERE session_id = '${session_id}'`;
           // connection.query(sql);
       }, 
       // statusFind
       function (statusSession, session) {
           console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
           //Create session wss return "serverClose" case server for close
           console.log('Session name: ', session);
       }, 
       // options
       {
           multidevice: true,
           // folderNameToken: 'tokens',
           mkdirFolderToken: '',
           headless: true,
           devtools: false,
           useChrome: true,
           debug: false,
           logQR: true,
           browserWS: '',
           browserArgs: [''],
           puppeteerOptions: { args: ['--no-sandbox'] },
           disableSpins: true,
           disableWelcome: true,
           updatesLog: true,
           autoClose: 0,
           createPathFileToken: false
       })
           .then(function (client) {
           start(client);
       })["catch"](function (erro) {
           console.log(erro);
       });
}

startManual()



    // app.use('/qr_code', express.static('qr_code'));
    app.get('/att_img_perfil', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var contato_atendimento;
        return __generator(this, function (_a) {
            contato_atendimento = "SELECT * FROM clientes WHERE id = '" + id_cliente + "' LIMIT 1";
            connection.query(contato_atendimento, function (err, rows333, fields) {
                return __awaiter(this, void 0, void 0, function () {
                    var sql, contato_atendimento;
                    return __generator(this, function (_a) {
                        if (rows333[0]['att'] == 1) {
                            res.send(false);
                        }
                        else {
                            res.send(true);
                            sql = "UPDATE clientes SET att = 1 WHERE id = '" + id_cliente + "'";
                            connection.query(sql);
                            contato_atendimento = "SELECT * FROM contatos WHERE id_server = '" + id_cliente + "'";
                            connection.query(contato_atendimento, function (err, rows, fields) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var linhas, i, user, url, sql, sql, porcentagem_img;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                linhas = rows.length;
                                                i = 0;
                                                _a.label = 1;
                                            case 1:
                                                if (!(i < rows.length)) return [3 /*break*/, 6];
                                                return [4 /*yield*/, globalClient.getNumberProfile(rows[i].telefone + '@' + rows[i].server)];
                                            case 2:
                                                user = _a.sent();
                                                if (!(user != 404)) return [3 /*break*/, 4];
                                                return [4 /*yield*/, globalClient.getProfilePicFromServer(user.id._serialized)];
                                            case 3:
                                                url = _a.sent();
                                                if (url != undefined) {
                                                    console.log(url);
                                                    sql = "UPDATE contatos SET img = '" + url + "' WHERE id = '" + rows[i].id + "' AND id_server = '" + id_cliente + "'";
                                                    connection.query(sql);
                                                }
                                                _a.label = 4;
                                            case 4:
                                                if (i + 1 == rows.length) {
                                                    sql = "UPDATE clientes SET att = 0 WHERE id = '" + id_cliente + "'";
                                                    connection.query(sql);
                                                }
                                                porcentagem_img = (i + 1) / linhas;
                                                io.emit('porcentagem_img', porcentagem_img * 100);
                                                _a.label = 5;
                                            case 5:
                                                i = i + 1;
                                                return [3 /*break*/, 1];
                                            case 6: return [2 /*return*/];
                                        }
                                    });
                                });
                            });
                        }
                        return [2 /*return*/];
                    });
                });
            });
            return [2 /*return*/];
        });
    }); });
    function verificarstatus() {
        var contato_atendimento = "SELECT * FROM fila WHERE id_server = '" + id_cliente + "'";
        connection.query(contato_atendimento, function (err, rows, fields) {
            return __awaiter(this, void 0, void 0, function () {
                var i, IsOnline, saida;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < rows.length)) return [3 /*break*/, 4];
                            return [4 /*yield*/, globalClient.getChatIsOnline(rows[i].chatId)];
                        case 2:
                            IsOnline = _a.sent();
                            saida = {
                                chat_id: rows[i].chatId,
                                status: IsOnline
                            };
                            io.emit('status_user', saida);
                            _a.label = 3;
                        case 3:
                            i = i + 1;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        });
    }
    function start(client) {
        var _this = this;
        globalClient = client;
        client.getSessionTokenBrowser(true);
        setInterval(function () { verificarstatus(); }, 10000);
        var mensagem_boas_vindas = '👨🏻‍💻 *Bem vindo a Espíndola & Helfrich* 👨🏻‍💻,\nSeu WhatsApp esta sendo automaziado por *Call-Chronus*';
        client.sendText(wa_id, mensagem_boas_vindas);

        

        client.onMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            console.log(message)

            if(!message.chatId){
                message.chatId = message.from;
            }

            if(!message.sender){
                message.sender = {
                    verifiedName: message.notifyName
                    }
            }
            console.log(message.type)
            if(message.type == 'reply'){
                message.type = 'chat';
            }

           
            var verificaChat = message.chatId.split('@');
            var verificaChat = verificaChat[1];

            // if(verificaChat[1] == 'g.us' ){
            //     return false;
            // }
       
        
        

            var buffer_1, splits, fileName, fileName, diretorio_salva, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(message.isGroupMsg != true && message.broadcast != true && message.chatId != 'status@broadcast' && verificaChat != 'g.us')) return [3 /*break*/, 3];
                        if (!message.mimetype) return [3 /*break*/, 2];
                        return [4 /*yield*/, client.decryptFile(message)];
                    case 1:
                        buffer_1 = _a.sent();

                        if (typeof message.id === 'string' || message.id instanceof String){
                            splits = message.id.split('_', 3);
                        }else{
                            splits = message.id._serialized.split('_', 3);
                        }
                        
                        if (message.mimetype == 'image/jpeg' || message.mimetype == 'image/png' || message.mimetype == 'image/webp' || message.mimetype == 'video/mp4' || message.mimetype == 'video/3gpp' || message.mimetype == 'audio/ogg; codecs=opus') {
                            fileName = splits[1] + '_' + splits[2] + '.' + mime.extension(message.mimetype);
                        }
                        else {
                            fileName = "" + (splits[1] + '_' + splits[2] + '_' + message.filename);
                        }
                        diretorio_salva = 'arquivos/' + message.to + '/';
                        if (!fs.existsSync(diretorio_salva)) {
                            fs.mkdir(diretorio_salva, function (err) {
                                if (err) {
                                    console.log("Deu ruim...");
                                }
                                console.log("Diretório criado! =)");
                                fs.writeFile(diretorio_salva + fileName, buffer_1, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    console.log('download de arquivo foi salvo');
                                });
                            });
                        }
                        else {
                            fs.writeFile(diretorio_salva + fileName, buffer_1, function (err) {
                                if (err) {
                                    return console.log(err);
                                }
                                console.log('download de arquivo foi salvo');
                            });
                        }
                        message.body = diretorio_salva + fileName;
                        _a.label = 2;
                    case 2:
                        message.body = message.body.replaceAll("\'", "");
                        sql = "SELECT * FROM fila WHERE chatId = '" + message.chatId + "' AND id_server = '" + id_cliente + "'";
                        connection.query(sql, function (err, result) {
                            // VERIFICA SE ESTA NA FILA 
                            if (result.length > 0 && verificaChat != 'g.us') {
                                var temp = Date.now();
                                var sql = "UPDATE fila SET mensagem = '" + message.body + "', type = '" + message.type + "', time_msg = '" + temp + "' WHERE id = '" + result[0]['id'] + "' AND id_server = '" + id_cliente + "'";
                                connection.query(sql);
                                // ESTÁ NA FILA VERIFICA SE SELECIONOU UM SETOR
                                if (result[0]['setor'] != '0') {
                                    if(message.quotedMsg){

                                        if(message.quotedMsg.body){
                                            let str = message.quotedMsg.body;
                                            str = str.replace(/\*([^\*]+?)\*(?!\*)/i, '<strong>$1</strong>');
                                            message.body = `<b>Resposta</b> ↓ <br>`+str+`<hr>
                                            <b>Mensagem</b>: `+message.body;
                                        }
                                        
                                    }
                                    var sql = "INSERT INTO mensagens (chat_id, author, corpo, time_msg, message_id, type, senderName, recebido, usuario, setor, id_server) VALUES ?";
                                    var values = [
                                        [message.chatId, '0', message.body, Date.now(), message.id, message.type, message.sender.verifiedName, '0', result[0]['operador'], result[0]['setor'], id_cliente]
                                    ];
                                    connection.query(sql, [values], function (err, result_msng) {
                                        if (err)
                                            throw err;
                                    });
                                    var new_numero = message.from.split("@")[0];
                                    var mensagem = {
                                        chat_id: message.chatId,
                                        telefone: new_numero,
                                        mensagem: message.body,
                                        type: message.type
                                    };
                                    io.emit('new_chamado', '');
                                    io.emit('recebe_msg', mensagem);
                                }
                                else {
                                    // ESTÁ NA FILA  NÃO SELECIONOU UM SETOR
                                    var sql = "INSERT INTO mensagens (chat_id, author, corpo, time_msg, message_id, type, senderName, recebido, usuario, setor, id_server) VALUES ?";
                                    var values = [
                                        [message.chatId, '0', message.body, Date.now(), message.id, message.type, 'não cadastrado', '0', '0', '0', id_cliente]
                                    ];
                                    connection.query(sql, [values], function (err, result_msng) {
                                        if (err)
                                            throw err;
                                    });
                                    // LISTA SETORES
                                    connection.query("SELECT * FROM departamentos WHERE id_server = '" + id_cliente + "' ORDER BY numero asc", function (err, result_departamento, fields) {
                                        if (err)
                                            throw err;
                                        result_departamento.every(function (row) {
                                            var row_fila = row;
                                            if (row.numero == message.body) {
                                                var sql = "UPDATE fila SET setor = '" + row.id + "' WHERE id = '" + result[0]['id'] + "' AND id_server = '" + id_cliente + "'";
                                                connection.query(sql);
                                                mensagem_bot = 'Sua mensagem já foi recebida pelo nosso *' + row.nome + '* e está em fila de espera, aguarde que assim que possível retornamos sua mensagem.';
                                                var new_chat = {
                                                    chat_id: message.chatId,
                                                    setor: row.id
                                                };
                                                var telefone = message.chatId.split("@")[0];
                                                var contato_atendimento = "SELECT * FROM contatos WHERE telefone = '" + telefone + "' AND id_server = '" + id_cliente + "' LIMIT 1";
                                                connection.query(contato_atendimento, function (err, rows, fields) {
                                                    return __awaiter(this, void 0, void 0, function () {
                                                        var saida;
                                                        return __generator(this, function (_a) {
                                                            if (rows.length > 0) {
                                                                saida = {
                                                                    departamento: row.id,
                                                                    nome: rows[0]['nome'],
                                                                    telefone: rows[0]['telefone'],
                                                                    chat_id: rows[0]['telefone'] + '@c.us',
                                                                    empresa: rows[0]['nome'],
                                                                    img: rows[0]['img']
                                                                };
                                                                io.emit('transferir_chat', saida);
                                                                console.log('existe nos contatos');
                                                            }
                                                            else {
                                                                console.log('nao existe');

                                                                var new_numero = message.chatId.split("@")[0];
                                                                            saida = {
                                                                                departamento: row_fila.id,
                                                                                nome: new_numero,
                                                                                telefone: new_numero,
                                                                                chat_id: message.chatId,
                                                                                empresa: '',
                                                                                img: ''
                                                                            };
                                                                            io.emit('transferir_chat', saida);
                                                                //back code
                                                                // globalClient.getNumberProfile(message.chatId).then(function (newResult) {
                                                                //     if (newResult != 404) {
                                                                //         // globalClient.getProfilePicFromServer(message.chatId).then(function (newResult2) {
                                                                //             var newResult2 = undefined;
                                                                //             if (newResult2 == undefined) {
                                                                //                 newResult2 = '';
                                                                //             }
                                                                //             saida = {
                                                                //                 departamento: row.id,
                                                                //                 nome: newResult.id.user,
                                                                //                 telefone: newResult.id.user,
                                                                //                 chat_id: newResult.id._serialized,
                                                                //                 empresa: '',
                                                                //                 img: newResult2
                                                                //             };
                                                                //             io.emit('transferir_chat', saida);
                                                                //         // });
                                                                //     }
                                                                // });
                                                                // end back code
                                                            }
                                                            return [2 /*return*/];
                                                        });
                                                    });
                                                });
                                                return false;
                                            }
                                            else {
                                                mensagem_bot = '*[' + message.body + ']* não é um comando valido.';
                                                return true;
                                            }
                                        });
                                        // ENVIA SETORES PARA SELEÇÃO
                                        globalClient.sendText(message.chatId, mensagem_bot);
                                    });
                                }
                            }
                            else if(verificaChat != 'g.us') {
                                // NÃO ESTÁ NA FILA
                                var timestamp = Date.now();
                                var sql = "INSERT INTO mensagens (chat_id, author, corpo, time_msg, message_id, type, senderName, recebido, usuario, setor, id_server) VALUES ?";
                                var values = [
                                    [message.chatId, '0', message.body, message.timestamp, message.id, message.type, 'não cadastrado', '0', '0', '0', id_cliente]
                                ];
                                connection.query(sql, [values], function (err, result_msng) {
                                    if (err)
                                        throw err;
                                });
                                var sql = "INSERT INTO fila (mensagem, chatId, type, time_msg, senderName, author, setor, operador, usuario_chat, criacao, id_server) VALUES ?";
                                var values2 = [
                                    [message.body, message.chatId, message.type, Date.now(), 'não cadastrado', '0', '0', '0', '0', Date.now(), id_cliente]
                                ];
                                connection.query(sql, [values2]);
                              
                                var mensagem_bot = 'Olá, a Espíndola & Helfrich agradece seu contato, gentileza digitar o número do setor que deseja atendimento.\n\n';
                                connection.query("SELECT * FROM departamentos WHERE id_server = '" + id_cliente + "' ORDER BY numero asc", function (err, result, fields) {
                                    if (err)
                                        throw err;
                                    result.forEach(function (row) {
                                        if (row.status == '1') {
                                            mensagem_bot += '*' + row.numero + '* - ' + row.nome + '\n';
                                        }
                                    });
                                    globalClient.sendText(message.chatId, mensagem_bot);
                                });
                            }
                            // client.sendText(message.from, 'Welcome Venom 🕷');
                            // console.log(message)
                        });
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        app.post('/info_perfil', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var user, status, url, Contact, IsOnline, saida;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, globalClient.getNumberProfile(req.body.chat_id)];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, globalClient.getStatus(req.body.chat_id)];
                    case 2:
                        status = _a.sent();
                       
                        return [4 /*yield*/, globalClient.getProfilePicFromServer(req.body.chat_id)];
                    case 3:
                        url = _a.sent();
                        return [4 /*yield*/, globalClient.getContact(req.body.chat_id)];
                    case 4:
                        Contact = _a.sent();
                        return [4 /*yield*/, globalClient.getChatIsOnline(req.body.chat_id)];
                    case 5:
                        IsOnline = _a.sent();
                        saida = {
                            user: user,
                            status: status,
                            url: url,
                            Contact: Contact,
                            IsOnline: IsOnline
                        };
                        res.json(saida);
                        return [2 /*return*/];
                }
            });
        }); });
        app.post('/departamentos', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var contato_atendimento;
            return __generator(this, function (_a) {
                contato_atendimento = "SELECT * FROM departamentos WHERE id_server = '" + id_cliente + "'";
                connection.query(contato_atendimento, function (err, rows, fields) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            res.json(rows);
                            return [2 /*return*/];
                        });
                    });
                });
                return [2 /*return*/];
            });
        }); });
        app.post('/disponivel', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var contato, contato_atendimento;
            return __generator(this, function (_a) {
                contato = req.body.telefone;
                contato_atendimento = "SELECT\n                              fila.id AS fila_id,\n                              fila.chatId As chat_id,\n                              fila.setor AS setor_fila,\n                              fila.operador AS operador_fila,\n                              usuarios.nome_usuario AS user_name,\n                              departamentos.nome AS dep_name\n                                FROM fila \n                                LEFT JOIN usuarios\n                                 ON fila.operador = usuarios.id_usuario\n                                JOIN departamentos\n                                 ON fila.setor = departamentos.id\n                                 WHERE fila.id_server = '" + id_cliente + "' \n                                   AND fila.chatId = '" + contato + "'";
                connection.query(contato_atendimento, function (err, rows, fields) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (rows.length > 0) {
                                res.json(rows);
                            }
                            else {
                                res.json(false);
                            }
                            return [2 /*return*/];
                        });
                    });
                });
                return [2 /*return*/];
            });
        }); });
        app.post('/disponivel_fila_espera', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var contato, contato_atendimento;
            return __generator(this, function (_a) {
                contato = req.body.telefone;
                contato_atendimento = "SELECT\n                              fila.id AS fila_id,\n                              fila.chatId As chat_id,\n                              fila.setor AS setor_fila,\n                              fila.operador AS operador_fila,\n                              usuarios.nome_usuario AS user_name,\n                              departamentos.nome AS dep_name\n                                FROM fila \n                                LEFT JOIN usuarios\n                                 ON fila.operador = usuarios.id_usuario\n                                LEFT JOIN departamentos\n                                 ON fila.setor = departamentos.id\n                                 WHERE fila.id_server = '" + id_cliente + "' \n                                   AND fila.chatId = '" + contato + "'";
                connection.query(contato_atendimento, function (err, rows, fields) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (rows.length > 0) {
                                res.json(rows);
                            }
                            else {
                                res.json(false);
                            }
                            return [2 /*return*/];
                        });
                    });
                });
                return [2 /*return*/];
            });
        }); });
        app.post('/atendimento', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var getUser, userData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        getUser = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            var sql_ativos = "SELECT fila.id,\n                         fila.mensagem,\n                         fila.type,\n                         fila.time_msg,\n                         fila.chatId,\n                         fila.senderName,\n                         fila.author,\n                         contatos.nome,\n                         contatos.telefone,\n                         contatos.email,\n                         contatos.empresa,\n                         contatos.server,\n                         contatos.img\n                    FROM fila \n                    LEFT JOIN contatos\n                    ON fila.chatId LIKE CONCAT('%', contatos.telefone, '%')\n                    AND contatos.id_server = '" + id_cliente + "'\n                    WHERE fila.id_server = '" + id_cliente + "'\n                    AND fila.operador = '" + req.body.operador + "'\n                    ORDER BY fila.time_msg DESC";
                                            connection.query(sql_ativos, function (err2, results) {
                                                resolve(results);
                                            });
                                        })];
                                });
                            });
                        };
                        return [4 /*yield*/, getUser()];
                    case 1:
                        userData = _a.sent();
                        res.json(userData);
                        return [2 /*return*/];
                }
            });
        }); });
        app.post('/verifica_contato', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var data, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            "usuario": ""
                        };
                        return [4 /*yield*/, globalClient.getNumberProfile(req.body.contato)];
                    case 1:
                        user = _a.sent();
                        if (user != '404') {
                            data["usuario"] = user.id;
                            res.json(data);
                        }
                        else {
                            res.send(false);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        app.post('/mensagens', function (req, res) {
            var contato_atendimento = "SELECT * FROM mensagens WHERE chat_id = '" + req.body.chat_id + "' AND id_server = '" + id_cliente + "' ORDER BY id DESC LIMIT 100";
            connection.query(contato_atendimento, function (err, rows, fields) {
                if (rows.length != 0) {
                    rows.reverse()
                    res.json(rows);
                }
                else {
                    res.json(false);
                }
            });
        });
        app.post('/envia_mensagem', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (req.body.contato != null && req.body.mensagem != null) {
                  console.log('/enviar_mensagem')
                    envia_mensagem(req.body.contato, req.body.mensagem, req.body.operador, req.body.setor, 'txt');
                    return [2 /*return*/, res.send(true)];
                }
                else {
                    return [2 /*return*/, res.send(false)];
                }
                return [2 /*return*/];
            });
        }); });
        app.post('/contatos', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var meus_contatos, contato_atendimento;
            return __generator(this, function (_a) {
                meus_contatos = [];
                contato_atendimento = "SELECT * FROM contatos WHERE id_server = '" + id_cliente + "'";
                connection.query(contato_atendimento, function (err, rows, fields) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (rows.length != 0) {
                                res.json(rows);
                            }
                            else {
                                res.json(false);
                            }
                            return [2 /*return*/];
                        });
                    });
                });
                return [2 /*return*/];
            });
        }); });
        app.post('/fila_espera', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var meus_contatos, contato_atendimento;
            return __generator(this, function (_a) {
                meus_contatos = [];
                contato_atendimento = "SELECT fila.id,\n    fila.mensagem,\n    fila.type,\n    fila.time_msg,\n    fila.chatId,\n    fila.senderName,\n    fila.author,\n    contatos.nome,\n    contatos.telefone,\n    contatos.email,\n    contatos.empresa,\n    contatos.server,\n    contatos.img\n    FROM fila \n    LEFT JOIN contatos\n    ON fila.chatId LIKE CONCAT('%', contatos.telefone, '%')\n    AND contatos.id_server = '" + id_cliente + "'\n    WHERE fila.id_server = '" + id_cliente + "'\n    AND fila.operador = 0\n    ORDER BY fila.time_msg DESC";
                connection.query(contato_atendimento, function (err, rows, fields) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (rows.length != 0) {
                                res.json(rows);
                            }
                            else {
                                res.json(false);
                            }
                            return [2 /*return*/];
                        });
                    });
                });
                return [2 /*return*/];
            });
        }); });
    }
    function envia_mensagem(contato, mensagem, operador, setor, type, nome_operador) {
        if(nome_operador){
            nome_operador = '*'+nome_operador+'*:';
        }else{
            nome_operador = '*Espindola & Helfrich*:';
        }

        if (operador == '') {
            operador = 0;
        }
        if (setor == '') {
            setor = 0;
        }
        var mensagem = mensagem.replaceAll("\'", "");

var Whatsmensagem = `${nome_operador}
`+mensagem;
        if (type == 'txt') {
            globalClient.sendText(contato, Whatsmensagem)
                .then(function (result) {
                console.log(result);
                var ts = Date.now();
                result.body = result.text.replaceAll("\'", "");
                mensagem = mensagem.replaceAll("\'", "");
                result.id = result.to._serialized;
                result.to = result.to.remote._serialized;
                var sql = "INSERT INTO mensagens (chat_id, author, corpo, time_msg, message_id, type, senderName, recebido, usuario, setor, id_server) VALUES ?";
                var values = [
                    [result.to, '1', mensagem, ts, result.id, 'chat', 'não cadastrado', '0', operador, setor, id_cliente]
                ];
                connection.query(sql, [values], function (err, result_msng) {
                    if (err)
                        throw err;
                    var sql = "UPDATE fila SET mensagem = '" + mensagem + "', type = 'chat', time_msg = '" + ts + "' WHERE chatId = '" + result.to + "' AND id_server = '" + id_cliente + "'";
                    connection.query(sql);
                });
            })["catch"](function (erro) {
                console.error('Error when sending: ', erro); //return object error
            });
        }
        else if (type == 'file') {
            globalClient.sendFile(contato, mensagem, '', '')
                .then(function (result) {
                console.log(result);
                var ts = Date.now();
                if (result.mimeType == 'image/jpeg' || result.mimeType == 'image/png') {
                    var tipo = 'image';
                }
                else if (result.mimeType == 'video/mp4' || result.mimeType == 'video/3gpp') {
                    var tipo = 'video';
                }
                else if (result.mimeType == 'image/webp') {
                    var tipo = 'sticker';
                }
                else if (result.mimeType == 'audio/aac' || result.mimeType == 'audio/mp4' || result.mimeType == 'audio/amr' || result.mimeType == 'audio/mpeg' || result.mimeType == 'audio/ogg; codecs=opus') {
                    var tipo = 'audio';
                }
                else {
                    var tipo = 'document';
                }
                var sql = "INSERT INTO mensagens (chat_id, author, corpo, time_msg, message_id, type, senderName, recebido, usuario, setor, id_server) VALUES ?";
                var values = [
                    [result.to.remote._serialized, '1', mensagem, ts, result.to._serialized, tipo, 'não cadastrado', '0', operador, setor, id_cliente]
                ];
                connection.query(sql, [values], function (err, result_msng) {
                    if (err)
                        throw err;
                    var sql = "UPDATE fila SET mensagem = '" + mensagem + "', type = '" + tipo + "', time_msg = '" + ts + "' WHERE chatId = '" + result.to.remote._serialized + "' AND id_server = '" + id_cliente + "'";
                    connection.query(sql);
                });
            })["catch"](function (erro) {
                console.error('Error when sending: ', erro); //return object error
            });
        }
    }
    io.on('connection', function (socket) {
        socket.on('sendMessage', function (message) {
            envia_mensagem(message.contato, message.mensagem, message.operador, message.setor, 'txt', message.nome_operado);
        });
        if (globalClient != undefined) {
            socket.on('injecao', function (message) {
                var sql_new = "SELECT * FROM fila WHERE setor = '" + message.setor + "' AND operador = 0 AND id_server = '" + id_cliente + "'";
                connection.query(sql_new, function (err, retorno_query) {
                    var _loop_1 = function (i) {
                        telefone = retorno_query[i].chatId.split("@")[0];
                        contato_atendimento = "SELECT * FROM contatos WHERE telefone = '" + telefone + "' AND id_server = '" + id_cliente + "' LIMIT 1";
                        connection.query(contato_atendimento, function (err, rows, fields) {
                            return __awaiter(this, void 0, void 0, function () {
                                var saida;
                                return __generator(this, function (_a) {
                                    if (rows.length > 0) {
                                        saida = {
                                            departamento: retorno_query[i].setor,
                                            nome: rows[0]['nome'],
                                            telefone: rows[0]['telefone'],
                                            chat_id: rows[0]['telefone'] + '@c.us',
                                            empresa: rows[0]['nome'],
                                            img: rows[0]['img']
                                        };
                                        socket.emit('transferir_chat', saida);
                                        console.log('existe nos contatos');
                                    }
                                    else {
                                        console.log('nao existe');

                                        console.log('nao existe aqui 2');

                                        var new_numero = retorno_query[i].chatId.split("@")[0];
                                                    saida = {
                                                        departamento: retorno_query[i].setor,
                                                        nome: new_numero,
                                                        telefone: new_numero,
                                                        chat_id: retorno_query[i].chatId,
                                                        empresa: '',
                                                        img: ''
                                                    };
                                                    io.emit('transferir_chat', saida);


                                        // globalClient.getNumberProfile(retorno_query[i].chatId).then(function (newResult) {
                                        //     if (newResult != 404) {
                                        //         // globalClient.getProfilePicFromServer(retorno_query[i].chatId).then(function (newResult2) {
                                        //             var newResult2 = undefined;
                                        //             if (newResult2 == undefined) {
                                        //                 newResult2 = '';
                                        //             }
                                        //             saida = {
                                        //                 departamento: retorno_query[i].setor,
                                        //                 nome: newResult.id.user,
                                        //                 telefone: newResult.id.user,
                                        //                 chat_id: newResult.id._serialized,
                                        //                 empresa: '',
                                        //                 img: newResult2
                                        //             };
                                        //             socket.emit('transferir_chat', saida);
                                        //         // });
                                        //     }
                                        // });
                                    }
                                    return [2 /*return*/];
                                });
                            });
                        });
                    };
                    var telefone, contato_atendimento;
                    for (var i = 0; i < retorno_query.length; i = i + 1) {
                        _loop_1(i);
                    }
                });
            });
        }
        //  socket.on('sendfile', function(message){ 
        //    console.log(message)
        //   // envia_mensagem(message.contato,message.mensagem, message.operador, message.setor, 'file')
        //  });
        socket.on('sendfile', function (image) { return __awaiter(_this, void 0, void 0, function () {
            var buffer, caminho;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('hey');
                        return [4 /*yield*/, Buffer.from(image.imagem, 'base64')];
                    case 1:
                        buffer = _a.sent();

                      

                        caminho = 'arquivos/' + wa_id + '/' + image.data + '_' + image.nome;

                       var caminho_formatado = caminho.replaceAll("\'", "");
                       console.log(caminho)
                       console.log(caminho_formatado)

                        return [4 /*yield*/, fs.writeFile(caminho_formatado, buffer, function (err) {
                                if (err) {
                                    return console.log(err);
                                }
                                envia_mensagem(image.contato, caminho_formatado, image.operador, image.setor, 'file');
                                console.log('download de arquivo foi salvo');
                                var saida = {
                                    caminho: caminho_formatado,
                                    id: image.data,
                                    nome: image.nome
                                };
                                io.emit('att_enviado', saida);
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        socket.on('iniciar_atendimento', function (contato) {
            var ts = Date.now();
            var sql_new = "SELECT * FROM fila WHERE chatId = '" + contato.chat_id + "' AND id_server = '" + id_cliente + "' LIMIT 1";
            connection.query(sql_new, function (err, retorno_query) {
                if (retorno_query.length > 0) {
                    // se ja estiver na fila envia para remover o contato
                    var sql = "UPDATE fila SET setor = '" + contato.setor + "', operador = '" + contato.operador + "' WHERE chatId = '" + contato.chat_id + "' AND id_server = '" + id_cliente + "'";
                    connection.query(sql);
                }
                else {
                    var sql = "INSERT INTO fila (chatId, setor, operador, usuario_chat, criacao, id_server) VALUES ?";
                    var values2 = [
                        [contato.chat_id, contato.setor, contato.operador, contato.operador, ts, id_cliente]
                    ];
                    connection.query(sql, [values2], function (err, id_retorno) {
                    });
                }
            });
        });
        socket.on('encerra_contato_atendimento', function (mensagem) {
            var sql_fila = "DELETE FROM fila WHERE id_server = '" + id_cliente + "' AND chatId = '" + mensagem.contato_id + "' ";
            connection.query(sql_fila, function (err, result_msng) {
                if (err)
                    throw err;
                var mesagem_encerra = 'Sua sessão foi encerrada, agradecemos sua atenção!';
                envia_mensagem(mensagem.contato_id, mesagem_encerra, mensagem.operador, mensagem.setor, 'txt');
            });
        });
        socket.on('fechar_contato_atendimento', function (mensagem) {
            var sql_fila = "DELETE FROM fila WHERE id_server = '" + id_cliente + "' AND chatId = '" + mensagem.contato_id + "' ";
            connection.query(sql_fila, function (err, result_msng) {
                if (err)
                    throw err;
            });
        });
        socket.on('transferir_chat', function (chat) {
            console.log('vem  de chat', chat)

            console.log('fim')
            var sql = "UPDATE fila SET setor = '" + chat.departamento + "', operador = '0' WHERE chatId = '" + chat.chat_id + "' AND id_server = '" + id_cliente + "'";
            connection.query(sql);
            var contato_atendimento = "SELECT * FROM contatos WHERE telefone = '" + chat.telefone + "' AND id_server = '" + id_cliente + "' LIMIT 1";
            connection.query(contato_atendimento, function (err, rows, fields) {
                return __awaiter(this, void 0, void 0, function () {
                    var saida, user, url;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(rows.length > 0)) return [3 /*break*/, 1];
                                saida = {
                                    departamento: chat.departamento,
                                    nome: rows[0]['nome'],
                                    telefone: rows[0]['telefone'],
                                    chat_id: rows[0]['telefone'] + '@c.us',
                                    empresa: rows[0]['nome'],
                                    img: rows[0]['img']
                                };
                                io.emit('transferir_chat', saida);
                                return [3 /*break*/, 4];
                            case 1:
                                console.log('nao existe 67');
                                return [4 /*yield*/, globalClient.getNumberProfile(chat.chat_id)];
                            case 2:
                                user = _a.sent();
                                if (!(user != 404)) return [3 /*break*/, 4];
                                return [4 /*yield*/, globalClient.getProfilePicFromServer(chat.chat_id)];
                              
                            case 3:
                                url = _a.sent();
                                saida = {
                                    departamento: chat.departamento,
                                    nome: user.id.user,
                                    telefone: user.id.user,
                                    chat_id: user.id._serialized,
                                    empresa: '',
                                    img: url
                                };
                                io.emit('transferir_chat', saida);
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            });
        });
        socket.on('puxar_contato', function (chat) {
            console.log('asddsa');
            var contato_atendimento = "SELECT * FROM fila WHERE chatId = '" + chat.chat_id + "' AND id_server = '" + id_cliente + "' LIMIT 1";
            connection.query(contato_atendimento, function (err, fila, fields) {
                return __awaiter(this, void 0, void 0, function () {
                    var sql, telefone, saida2, telefone, saida;
                    return __generator(this, function (_a) {
                        if (fila.length > 0) {
                            if (fila[0]['operador'] == '0') {
                                sql = "UPDATE fila SET setor = '" + chat.departamento + "', operador = '" + chat.operador + "' WHERE id = '" + fila[0]['id'] + "'";
                                connection.query(sql);
                                telefone = fila[0]['chatId'].split("@")[0];
                                saida2 = {
                                    chat_id: fila[0]['chatId'],
                                    telefone: telefone
                                };
                                io.emit('remove_lista_espera', saida2);
                            }
                            else {
                                telefone = fila[0]['chatId'].split("@")[0];
                                saida = {
                                    departamento: fila[0]['operador'],
                                    operador: fila[0]['operador'],
                                    chat_id: fila[0]['chatId'],
                                    telefone: telefone
                                };
                                socket.emit('remove_chat_todos', saida);
                            }
                        }
                        else {
                        }
                        return [2 /*return*/];
                    });
                });
            });
        });
        socket.on('aceitar_chat', function (chat) {
            var contato_atendimento = "SELECT * FROM fila WHERE chatId = '" + chat.chat_id + "' AND id_server = '" + id_cliente + "' LIMIT 1";
            connection.query(contato_atendimento, function (err, fila, fields) {
                return __awaiter(this, void 0, void 0, function () {
                    var sql, telefone, saida2, telefone, saida;
                    return __generator(this, function (_a) {
                        if (fila.length > 0) {
                            if (fila[0]['operador'] == '0') {
                                sql = "UPDATE fila SET setor = '" + chat.departamento + "', operador = '" + chat.operador + "' WHERE chatId = '" + chat.chat_id + "' AND id_server = '" + id_cliente + "'";
                                connection.query(sql);
                                telefone = fila[0]['chatId'].split("@")[0];
                                saida2 = {
                                    chat_id: fila[0]['chatId'],
                                    telefone: telefone
                                };
                                io.emit('remove_lista_espera', saida2);
                            }
                            else {
                                telefone = fila[0]['chatId'].split("@")[0];
                                saida = {
                                    departamento: fila[0]['operador'],
                                    operador: fila[0]['operador'],
                                    chat_id: fila[0]['chatId'],
                                    telefone: telefone
                                };
                                socket.emit('remove_chat_todos', saida);
                            }
                        }
                        else {
                        }
                        return [2 /*return*/];
                    });
                });
            });
        });
        socket.on('remove_contato', function (chat) {
            var sql = "DELETE FROM contatos WHERE telefone = '" + chat.contato_id + "' AND id_server = '" + id_cliente + "'";
            connection.query(sql);
            io.emit('contato_remove', chat);
        });
    });
});
