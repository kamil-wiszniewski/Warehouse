//express node js
var express = require('express');
var cynkomet = express();

//body-parser
var bodyParser = require("body-parser");

cynkomet.set("view engine", "ejs");
cynkomet.use(bodyParser.urlencoded({extended: true}));

//css
cynkomet.use(express.static(__dirname + "/public"));

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'marcin',
  password : 'marcin',
  database : 'magazyn'
});

cynkomet.get("/", function(req, res){
 var q = 'SELECT COUNT(*) as count FROM pracownicy';
 connection.query(q, function (error, results) {
 if (error) throw error;
var count = results[0].count;
 //var msg = "We have " + results[0].count + " users";
 //res.send(msg);
res.render("home", {count: count});
 });
});

cynkomet.get("/asortyment", function(req, res){
res.render("asortyment");
 });

cynkomet.get("/ponazwisku", function(req, res){
res.render("ponazwisku");
 });

cynkomet.get("/wyszukiwanie", function(req, res){
res.render("wyszukiwanie");
});

cynkomet.get("/ponazwisku", function(req, res){
res.render("ponazwisku");
});

//button ekran główny
cynkomet.post('/ekran_glowny', function(req,res){
 res.render("home");
});

//button WYSZUKIWANIE PO NAZWISKU
cynkomet.post('/wyszukaj_po_nazwisku', function(req,res){
 res.render("ponazwisku");
});

//button ADMINISTRACJA
cynkomet.post('/administracja', function(req,res){
 res.render("administracja");
});

//button DODAWANIE PRACOWNIKA
cynkomet.post('/dodawanie_pracownika', function(req,res){
 res.render("dodawanie_pracownika");
});

//button USUWANIE PRACOWNIKA
cynkomet.post('/usun_pracownika', function(req,res){
 res.render("usuwanie_pracownika");
});

//button DODAWANIE ASORTYMENTU
cynkomet.post('/dodaj_asortyment', function(req,res){
 res.render("dodaj_asortyment");
});

//button USUWANIE ASORTYMENTU
cynkomet.post('/usun_asortyment', function(req,res){
 res.render("usuwanie_asortymentu");
});

//button WYSZUKAJ_PO_ID
cynkomet.post('/wyszukaj_po_id', function(req,res){

 //wyciągnięcie rfid pracownika
 var rfid = req.body.rfid_pracownika;
 
 //sprawdzenie czy pracownik jest w bazie
 var q = 'SELECT * from pracownicy WHERE rfid_pracownika LIKE ?';
connection.query(q, [rfid], function (error, result) {
  if (error) throw error;

  //pracownika nie ma w bazie
  else if (result.length === 0) { res.render("niemaid"); }

  //pracownik jest w bazie
  else  {var result=result; 
      res.render("wydawanie", {result: result});}
  });
});


//button DODAWANIA PRACOWNIKA
cynkomet.post('/dodaj_pracownika', function(req,res){
 
//sprawdzanie czy pracownika o danym rfid nie ma już w bazie
var rfid = req.body.rfid_pracownika;
var q = 'SELECT * from pracownicy WHERE rfid_pracownika = ?';
connection.query(q, [rfid], function (error, result) {
  if (error) throw error;

  else if (result.length ==! 0) { res.render("pracownik_istnieje"); }

  else {var pracownik = {rfid_pracownika: req.body.rfid_pracownika,
                  imie: req.body.imie,
                  nazwisko: req.body.nazwisko,
                  stanowisko: req.body.stanowisko,
                  wydzial: req.body.wydzial
                }

 connection.query('INSERT INTO pracownicy SET ?', pracownik, function(err, result) {
 });

//wyciągnięcie rfid pracownika
  var rfid = req.body.rfid_pracownika;

//zapytanie sql o dane pracownika o danym rfid
  var q = 'SELECT * from pracownicy WHERE rfid_pracownika = ?';
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;

  //wysyłanie wyniku na stronę dodano
  var result=result; 
  res.render("dodano", {result: result});
 });
}
 });
});


cynkomet.post('/ponazwisku', function(req, res){
var ponazwisku = req.body.ponazwisku;
var q = 'SELECT * from pracownicy WHERE nazwisko LIKE CONCAT("%", ?, "%") ORDER BY nazwisko, imie';
connection.query(q, [ponazwisku], function (error, result) {
if (error) throw error;

var result=result; 

res.render("wyszukiwanie", {result: result});
});
});


// button "wybierz" na stronie z wynikami wyszukiwań po nazwisku
cynkomet.post('/wybierz', function(req, res){
  
  //wyciągnięcie rfid_pracownika z przesłanego obiektu
  var rfid = req.body.rfid;
  
  //zapytanie sql o dane pracownika o danym rfid
  var q = 'SELECT * from pracownicy WHERE rfid_pracownika = ?';
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;

  //wysyłanie wyniku na stronę wydawania
  var result=result; 
  res.render("wydawanie", {result: result});
});
});


// button "wydawanie"
cynkomet.post('/wydawanie', function(req, res){
  
  //wyciągnięcie potrzebnych danych
  var kod = req.body.kod_rzeczy;
  var ilosc = req.body.ilosc;
  var rfid = req.body.rfid;

  //sprawdzanie czy dany asortyment jest w bazie
  var q = 'SELECT id FROM asortyment WHERE kod_kreskowy = ?';
  connection.query(q, [kod], function (error, result) {
  if (error) throw error;  
  
  //asortymentu nie ma w bazie
  else if (result.length === 0) { 

  var q=  'SELECT * FROM pracownicy WHERE rfid_pracownika = ?;'
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;  

  //przeniesienie na ekran WYDAWANIE
  var result=result; 

  res.render("nie_ma_asortymentu", {result: result}); } ) }

  //pracownik jest w bazie
  else  {

  //rejestracja wydania w bazie danych
  var q= 'INSERT INTO statystyki(pracownik_rfid, asortyment_kod, ilosc) VALUES (?, ?, ?)';
  connection.query(q, [rfid, kod, ilosc], function (error, result) {
  if (error) throw error;  
  });

  //wyszukanie danych dla ekranu WYDANO
  var q=  'SELECT rfid_pracownika, imie, nazwisko, nazwa, statystyki.ilosc, statystyki.created_at, statystyki.id FROM pracownicy JOIN statystyki ON pracownicy.rfid_pracownika=statystyki.pracownik_rfid JOIN asortyment ON statystyki.asortyment_kod = asortyment.kod_kreskowy WHERE rfid_pracownika = ? ORDER BY statystyki.created_at DESC LIMIT 1';
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;
  
  //przeniesienie na ekran WYDANO
  var result=result; 
  res.render("wydano", {result: result});  
    });
 }
  });
});


// button "wydaj_kolejna"
cynkomet.post('/wydaj_kolejna', function(req, res){
  
  //wyciągnięcie potrzebnych danych
  var rfid = req.body.rfid;

  //wyszukanie pracownika o danym id, aby były dane na ekran wydawanie
  var q=  'SELECT * FROM pracownicy WHERE rfid_pracownika = ?;'
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;
  
  //przeniesienie na ekran WYDAWANIE
  var result=result; 
  res.render("wydawanie", {result: result});
  });  
});


// button "wydaj_inny"
cynkomet.post('/wydaj_inny', function(req, res){
  
  //wyciągnięcie potrzebnych danych
  var rfid = req.body.rfid;

  //wyszukanie pracownika o danym id, aby były dane na ekran wydawanie
  var q=  'SELECT * FROM pracownicy WHERE rfid_pracownika = ?;'
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;
  
  //przeniesienie na ekran WYDAWANIE
  var result=result; 
  res.render("wydawanie", {result: result});
  });  
});


// button "anuluj_wydanie"
cynkomet.post('/anuluj_wydanie', function(req, res){
  
  //anulowanie ostatniego wydania
  var q= 'DELETE from statystyki ORDER BY id DESC LIMIT 1;'
  connection.query(q, function (error, result) {
  if (error) throw error;
  }); 

  //powrót na ekran wydawanie
  //wyciągnięcie potrzebnych danych
  var rfid = req.body.rfid;

  //wyszukanie pracownika o danym id, aby były dane na ekran wydawanie
  var q=  'SELECT * FROM pracownicy WHERE rfid_pracownika = ?;'
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;
  
  //przeniesienie na ekran WYDAWANIE
  var result=result; 
  res.render("wydawanie", {result: result});
  });  
});


// button "anuluj_dodanie"
cynkomet.post('/anuluj_dodanie', function(req, res){
  
  //anulowanie ostatniego dodanego pracownika
  var q= 'DELETE from pracownicy ORDER BY id DESC LIMIT 1;'
  connection.query(q, function (error, result) {
  if (error) throw error;
  }); 

  res.render("administracja");    
});


//button "szukaj_usuń"
cynkomet.post('/szukaj_usun', function(req, res){
  
 //wyciągnięcie rfid i nazwiska pracownika
  var rfid = req.body.rfid_pracownika;
  var nazwisko = req.body.nazwisko;

//zapytanie sql o dane pracownika o danym rfid
  var q = 'SELECT * from pracownicy WHERE rfid_pracownika = ?';
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;

  else if (result.length !== 0) { //wyszukanie pracownika o danym id, aby były dane na ekran dousuniecia1
                                  var q=  'SELECT * FROM pracownicy WHERE rfid_pracownika = ?;'
                                  connection.query(q, [rfid], function (error, result) {
                                  if (error) throw error;
                                  
                                  //przeniesienie na ekran DOUSUNIECIA1
                                  var result=result; 
                                  res.render("dousuniecia1", {result: result});
                                  }); 
                                }

  else {  var q = 'SELECT * from pracownicy WHERE nazwisko LIKE CONCAT("%", ?, "%") ORDER BY nazwisko, imie;'
          connection.query(q, [nazwisko], function (error, result) {
          if (error) throw error;

          var result=result; 
          res.render("dousuniecia2", {result: result});
          });
        }
 });    
});


// button "usun_pracownika2"
cynkomet.post('/usun_pracownika2', function(req, res){
  
  //wyciągnięcie rfid pracownika
  var rfid = req.body.rfid;

  //usunięcie pracownika
  var q= 'DELETE from pracownicy WHERE rfid_pracownika = ?;'
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;
  }); 

  res.render("usunieto");
    
});


// button "wybierz2"
cynkomet.post('/wybierz2', function(req, res){
  
  //wyciągnięcie rfid pracownika
  var rfid = req.body.rfid;

  var q=  'SELECT * FROM pracownicy WHERE rfid_pracownika = ?;'
  connection.query(q, [rfid], function (error, result) {
  if (error) throw error;
                                  
  //przeniesienie na ekran DOUSUNIECIA1
  var result=result; 
  res.render("dousuniecia1", {result: result});
  });    
});


//button dodaj_asortyment2
cynkomet.post('/dodaj_asortyment2', function(req,res){
 
//sprawdzanie czy asortymentu o danym kodzie nie ma już w bazie
var kod_kreskowy = req.body.kod_kreskowy;
var q = 'SELECT * from asortyment WHERE kod_kreskowy = ?;'

connection.query(q, [kod_kreskowy], function (error, result) {
  if (error) throw error;

  else if (result.length ==! 0) { res.render("asortyment_istnieje"); }
 
  else {
        var asortyment = {kod_kreskowy: req.body.kod_kreskowy,
                  nazwa: req.body.nazwa,
                  
                  }

 connection.query('INSERT INTO asortyment SET ?', asortyment, function(err, result) {
 });

//wyciągnięcie kodu kreskowego asortymentu
  var kod_kreskowy = req.body.kod_kreskowy;

//zapytanie sql o dane asortymentu o danym kodzie kreskowym
  var q = 'SELECT * from asortyment WHERE kod_kreskowy = ?'
  connection.query(q, [kod_kreskowy], function (error, result) {
  if (error) throw error;

  //wysyłanie wyniku na stronę dodano asortyment
  var result=result; 
  res.render("dodano_asortyment", {result: result});

 });
}
});
});


// button "anuluj_dodanie2"
cynkomet.post('/anuluj_dodanie2', function(req, res){
  
  //anulowanie ostatnio dodanego asortymentu
  var q= 'DELETE from asortyment ORDER BY id DESC LIMIT 1;'
  connection.query(q, function (error, result) {
  if (error) throw error;
  }); 

  res.render("administracja");    
});


//button "szukaj_usuń_asortyment"
cynkomet.post('/szukaj_usun_asortyment', function(req, res){
  
 //wyciągnięcie kodu i nazwy asortymentu
  var kod = req.body.kod;
  var nazwa = req.body.nazwa;
  
//zapytanie sql o dane asortymentu o danym kodzie
  var q = 'SELECT * from asortyment WHERE kod_kreskowy = ?;'
  connection.query(q, [kod], function (error, result) {
  if (error) throw error;

  else if (result.length !== 0) { //wyszukanie asortymentu o danym kodzie, aby były dane na ekran dousuniecia3
                                  var q=  'SELECT * FROM asortyment WHERE kod_kreskowy = ?'
                                  connection.query(q, [kod], function (error, result) {
                                  if (error) throw error;
                                  
                                  //przeniesienie na ekran DOUSUNIECIA3
                                  var result=result; 
                                  res.render("dousuniecia3", {result: result});
                                  }); 
                                }

  else {  var q = 'SELECT * from asortyment WHERE nazwa LIKE CONCAT("%", ?, "%") ORDER BY nazwa;'
          connection.query(q, [nazwa], function (error, result) {
          if (error) throw error;

          var result=result; 
          res.render("dousuniecia4", {result: result});
          });
        }
  });    
});


// button "usun_asortyment2"
cynkomet.post('/usun_asortyment2', function(req, res){
  
  //wyciągnięcie kodu kreskowego
  var kod = req.body.kod;

  //usunięcie asortymentu
  var q= 'DELETE from asortyment WHERE kod_kreskowy = ?'
  connection.query(q, [kod], function (error, result) {
  if (error) throw error;
  }); 

  res.render("usunieto2");
    
});


// button "wybierz3"
cynkomet.post('/wybierz3', function(req, res){
  
  //wyciągnięcie kodu kreskowego
  var kod = req.body.kod;

  var q=  'SELECT * FROM asortyment WHERE kod_kreskowy = ?;'
  connection.query(q, [kod], function (error, result) {
  if (error) throw error;
                                  
  //przeniesienie na ekran DOUSUNIECIA3
  var result=result; 
  res.render("dousuniecia3", {result: result});
  });    
});


//button statystyki
cynkomet.post('/statystyki', function(req, res){
  
    var q =  'SELECT CONCAT(nazwisko, " ",imie) AS pracownik FROM pracownicy ORDER BY nazwisko, imie;'
  connection.query(q, function (error, result) {
  if (error) throw error;
                            
  var result=result; 

      var q='SELECT nazwa FROM asortyment ORDER BY nazwa;'  
      connection.query(q, function (error, resu) {
      if (error) throw error;

      var resu=resu;

  res.render("statystyki", {result: result, resu: resu}); 

  });    
   });  

});


//button statystyki_wyszukaj
cynkomet.post('/statystyki_wyszukaj', function(req, res){
  
  //wyciągnięcie danych do zapytań
  var nazwisko = req.body.pracownik.substring(0, req.body.pracownik.indexOf(' '));
  var nazwa = req.body.asortyment;
  var od = req.body.od;
  var dodata = req.body.do;

    if (nazwisko == "wszyscy" && nazwa == "wszystko" ) {
     var q=  'SELECT rfid_pracownika, imie, nazwisko, nazwa, DATE_FORMAT(statystyki.created_at, "%Y-%m-%d %H:%i") AS data FROM pracownicy JOIN statystyki ON pracownicy.rfid_pracownika=statystyki.pracownik_rfid          JOIN asortyment ON statystyki.asortyment_kod = asortyment.kod_kreskowy          WHERE statystyki.created_at >= ? AND statystyki.created_at <= ?          ORDER BY statystyki.created_at DESC;'

      connection.query(q, [od, dodata], function (error, result) {
      if (error) throw error;

      var result=result;

      res.render("statystyki_wyszukanie", {result: result}); 

      }); 
      }

    else if (nazwisko == "wszyscy") {
     var q=  'SELECT rfid_pracownika, imie, nazwisko, nazwa, DATE_FORMAT(statystyki.created_at, "%Y-%m-%d %H:%i") AS data FROM pracownicy          JOIN statystyki ON pracownicy.rfid_pracownika=statystyki.pracownik_rfid          JOIN asortyment ON statystyki.asortyment_kod = asortyment.kod_kreskowy          WHERE nazwa = ? AND statystyki.created_at >= ? AND statystyki.created_at <= ?          ORDER BY statystyki.created_at DESC;'

      connection.query(q, [nazwa, od, dodata], function (error, result) {
      if (error) throw error;

      var result=result;

      res.render("statystyki_wyszukanie", {result: result}); 

      }); 
      }

    else if (nazwa == "wszystko") {
     var q=  'SELECT rfid_pracownika, imie, nazwisko, nazwa, DATE_FORMAT(statystyki.created_at, "%Y-%m-%d %H:%i") AS data FROM pracownicy          JOIN statystyki ON pracownicy.rfid_pracownika=statystyki.pracownik_rfid          JOIN asortyment ON statystyki.asortyment_kod = asortyment.kod_kreskowy          WHERE nazwisko = ? AND statystyki.created_at >= ? AND statystyki.created_at <= ?          ORDER BY statystyki.created_at DESC;'

      connection.query(q, [nazwisko, od, dodata], function (error, result) {
      if (error) throw error;

      var result=result;

      res.render("statystyki_wyszukanie", {result: result}); 

      }); 
      }
  
    else {
     var q=  'SELECT rfid_pracownika, imie, nazwisko, nazwa, DATE_FORMAT(statystyki.created_at, "%Y-%m-%d %H:%i") AS data FROM pracownicy          JOIN statystyki ON pracownicy.rfid_pracownika=statystyki.pracownik_rfid          JOIN asortyment ON statystyki.asortyment_kod = asortyment.kod_kreskowy          WHERE nazwa = ? AND nazwisko = ? AND statystyki.created_at >= ? AND statystyki.created_at <= ?          ORDER BY statystyki.created_at DESC;'

      connection.query(q, [nazwa, nazwisko, od, dodata], function (error, result) {
      if (error) throw error;

      var result=result;

      res.render("statystyki_wyszukanie", {result: result}); 

      }); 
      }   
  
  });  


cynkomet.listen(8081, function(){
	
//console.log("Serwer na porcie 8080")
});
