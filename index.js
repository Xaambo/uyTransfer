const http = require('http');
const fs = require('fs');
const url = require('url');
const formidable = require('formidable');
const htmlParse = require('./htmlParse');

const server = http.createServer((req, res) => {
    
    let ruta = url.parse(req.url, true).pathname;
    
    if (ruta.endsWith('/upload')) {
        
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
          
            var extensio = files.archivo.name.substr(files.archivo.name.lastIndexOf("."));
            var oldpath = files.archivo.path;
            var nouNom = Math.random().toString(36).substr(2) + extensio;
            var newpath = 'files/' + nouNom;
            var linkDescarrega = "downloads/" + nouNom;

            fs.rename(oldpath, newpath, function (err) {
                
                var stats = fs.statSync(newpath);
                
                var size = stats["size"];

                if (err || size > 10000000) {

                    fs.readFile('public/error.html', function(err, data){

                        if(!err){
            
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write(data);
                            res.end();
                        } else {
                            
                            fs.unlink(newpath, function(err, data){
                                if(err) throw err;
                            });

                            res.writeHead(500, {'Content-Type': 'text/html'});
                            res.end();
                        }
                    });

                } else {
                    
                    fs.readFile('public/upload.html', function(err, data){
                        
                        console.log(linkDescarrega);

                        data = htmlParse.htmlParse(data, linkDescarrega);

                        if(!err){
            
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write(data);
                            res.end();

                            var stringJSON = fs.readFileSync('log.json');

                            stringJSON = stringJSON.toString().substr(0, (stringJSON.length - 1));

                            fs.appendFileSync('log.json', stringJSON);

                            let json = `,{"archivo": "${nouNom}", "tipo": "${extensio}", "tamano": "${size}bytes", "link": "${linkDescarrega}"}]\n`;

                            fs.appendFile('log.json', json, function (err) {
					
                                if (err) throw err;
        
                            });

                        } else {
            
                            res.writeHead(500, {'Content-Type': 'text/html'});
                            res.end();
                        }
                    });
                }
            });
        });
    
    } else if (ruta.includes('/downloads')) {
        
        /*console.log(req);*/
        
        /*var numero = lastIndexOf(ruta, "download/");*/

        var arxiu = req.url;

        arxiu = arxiu.substr(arxiu.lastIndexOf("/") + 1);

        console.log(arxiu); 

        fs.readFile("files/" + arxiu, function(err, data){

            if(!err){
                res.writeHead(200, {'Content-Type': 'application/octet-stream'});
                res.write(data);
                res.end();
            } else {
                res.writeHead(500, {'Content-Type': 'application/octet-stream'});
                res.end();
            }
        });

        console.log("henlo");

    } else { 
        
        fs.readFile('public/home.html', function(err, data){

            if(!err){
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            } else {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end();
            }
        });
    }
});

server.listen(8080);