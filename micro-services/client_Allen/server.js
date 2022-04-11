var PROTO_PATH = './allenchat.proto';
 //const isPortReachable = require('is-port-reachable');

 
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
 var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

 var grpcChat = protoDescriptor.io.mark.grpc.grpcChat;
 var clients = new Map();
 const Server_Add = '0.0.0.0:5000';
 const Client_Add = '0.0.0.0.:8000';
 
 function chat(call) {
     call.on('data', function(ChatMessage) {
       user=call.metadata.get('username');
       msg=ChatMessage.message;
       console.log(`${user} ==> ${msg}`);
       for (let [msgUser, userCall] of clients) {
         if (msgUser != user) {
           userCall.write(
             {
             from: user,
             message : msg
           });
         }
       }
       if (clients.get(user) === undefined) {
         clients.set(user, call);
       }

     });
     call.on('end', function() {
       call.write({
         fromName: 'Chat server',
       message : 'Nice to see ya! Come back again...'
     });
       call.end();
     });
   }


var server = new grpc.Server();
server.addService(grpcChat.ChatService.service, {
    chat:chat
});
server.bind(Server_Add, grpc.ServerCredentials.createInsecure());
server.start();
console.log("Allen Chat Server started on 0.0.0.0:5000");
//console.log(isPortReachable(8000, {host: '0.0.0.0'}));


function callService(){
  var client = new grpcChat.ChatService('localhost:8000',
  grpc.credentials.createInsecure());
const readline = require("readline");
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

var user = process.argv[2];
var metadata = new grpc.Metadata();
metadata.add('username', user);
var call = client.chat(metadata);

call.on('data', function(ChatMessage) {
console.log(`${ChatMessage.from} ==> ${ChatMessage.message}`);
});
call.on('end', function() {
console.log('Server ended call');
});
call.on('error', function(e) {
console.log(e);
});

rl.on("line", function(line) {
if (line === "quit") {
call.end();
rl.close();
} else {
call.write({
message : line
});
}
});

console.log('Enter your messages below:');
}

 setTimeout(callService,7000);