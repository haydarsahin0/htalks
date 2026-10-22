/* =========================================================
   FUTBOLCU HAVUZU (Kör Müzayede + otomatik sorular)
   ---------------------------------------------------------
   P(isim, wikipedia, mevki, ülke, açıklama, gruplar, doğumYılı, boy)
     wikipedia : İngilizce Wikipedia sayfa başlığı ("" = isimle aynı)
     mevki     : KL · DF · OS · FV
     ülke      : bayrak kodu (flagcdn.com)
     gruplar   : e = efsane · y = günümüz yıldızı · t = Türk futbolu
     doğumYılı : "X hangi yıl doğdu?" soruları için (0 = bilinmiyor)
     boy       : cm, "X kaç santim?" soruları için (0 = yok)
   ========================================================= */
(function () {
  const L = [];
  function P(n, w, p, c, t, g, y, h) {
    L.push({ n, w: w || n, p, c, t, g: g.split("").map((x) => ({ e: "efsane", y: "yildiz", t: "turk" })[x]), y: y || 0, h: h || 0 });
  }

  /* ================= EFSANELER ================= */
  // Kaleciler
  P("Gianluigi Buffon", "", "KL", "it", "Juventus · 2006 Dünya Kupası", "e", 1978, 192);
  P("Iker Casillas", "", "KL", "es", "Real Madrid · 2010 Dünya Kupası", "e", 1981, 185);
  P("Oliver Kahn", "", "KL", "de", "Bayern Münih", "e", 1969, 188);
  P("Peter Schmeichel", "", "KL", "dk", "Manchester United", "e", 1963, 191);
  P("Edwin van der Sar", "", "KL", "nl", "Ajax · Manchester United", "e", 1970, 197);
  P("Petr Čech", "", "KL", "cz", "Chelsea efsanesi", "e", 1982, 196);
  P("Dino Zoff", "", "KL", "it", "1982 Dünya Kupası kaptanı", "e", 1942);
  P("Gordon Banks", "", "KL", "gb-eng", "1966 Dünya Kupası", "e", 1937);
  P("Sepp Maier", "", "KL", "de", "Bayern · 1974 Dünya Kupası", "e", 1944);
  P("Fabien Barthez", "", "KL", "fr", "1998 Dünya Kupası", "e", 1971);
  P("Víctor Valdés", "", "KL", "es", "Barcelona", "e", 1982);
  P("Jens Lehmann", "", "KL", "de", "Arsenal 'Yenilmezler'", "e", 1969);
  P("Júlio César", "Júlio César (footballer, born 1979)", "KL", "br", "Inter treble", "e", 1979);
  P("Dida", "Dida (footballer, born 1973)", "KL", "br", "Milan", "e", 1973);
  P("David Seaman", "", "KL", "gb-eng", "Arsenal", "e", 1963);
  P("Pepe Reina", "", "KL", "es", "Liverpool · Napoli", "e", 1982);
  P("Cláudio Taffarel", "", "KL", "br", "1994 Dünya Kupası · Galatasaray", "et", 1966);
  P("Rüştü Reçber", "", "KL", "tr", "2002 Dünya Kupası üçüncülüğü", "et", 1973);
  P("Volkan Demirel", "", "KL", "tr", "Fenerbahçe efsanesi", "t", 1981);
  P("Fernando Muslera", "", "KL", "uy", "Galatasaray efsanesi", "t", 1986, 190);

  // Defans
  P("Paolo Maldini", "", "DF", "it", "Milan · 5× Şampiyonlar Ligi", "e", 1968, 186);
  P("Franco Baresi", "", "DF", "it", "Milan kaptanı", "e", 1960);
  P("Fabio Cannavaro", "", "DF", "it", "2006 Ballon d'Or", "e", 1973, 176);
  P("Alessandro Nesta", "", "DF", "it", "Lazio · Milan", "e", 1976, 187);
  P("Franz Beckenbauer", "", "DF", "de", "Der Kaiser", "e", 1945);
  P("Carles Puyol", "", "DF", "es", "Barcelona kaptanı", "e", 1978, 178);
  P("Roberto Carlos", "", "DF", "br", "Real Madrid · Fenerbahçe", "et", 1973, 168);
  P("Cafu", "", "DF", "br", "2× Dünya Kupası", "e", 1970, 176);
  P("Sergio Ramos", "", "DF", "es", "Real Madrid · 4× Şampiyonlar Ligi", "e", 1986, 184);
  P("Gerard Piqué", "", "DF", "es", "Barcelona", "e", 1987, 194);
  P("Marcelo", "Marcelo (footballer, born 1988)", "DF", "br", "Real Madrid", "e", 1988, 174);
  P("Philipp Lahm", "", "DF", "de", "Bayern · 2014 Dünya Kupası", "e", 1983, 170);
  P("Rio Ferdinand", "", "DF", "gb-eng", "Manchester United", "e", 1978, 189);
  P("John Terry", "", "DF", "gb-eng", "Chelsea kaptanı", "e", 1980, 187);
  P("Nemanja Vidić", "", "DF", "rs", "Manchester United", "e", 1981, 188);
  P("Ashley Cole", "", "DF", "gb-eng", "Arsenal · Chelsea", "e", 1980, 176);
  P("Lilian Thuram", "", "DF", "fr", "1998 Dünya Kupası", "e", 1972, 185);
  P("Marcel Desailly", "", "DF", "fr", "Milan · Chelsea", "e", 1968);
  P("Laurent Blanc", "", "DF", "fr", "1998 Dünya Kupası", "e", 1965);
  P("Javier Zanetti", "", "DF", "ar", "Inter kaptanı", "e", 1973, 178);
  P("Lúcio", "", "DF", "br", "2002 Dünya Kupası · Inter", "e", 1978);
  P("Thiago Silva", "", "DF", "br", "Milan · PSG · Chelsea", "e", 1984, 183);
  P("Dani Alves", "", "DF", "br", "Barcelona · Sevilla", "e", 1983, 172);
  P("Jaap Stam", "", "DF", "nl", "Manchester United", "e", 1972, 191);
  P("Ronald Koeman", "", "DF", "nl", "Barcelona 1992", "e", 1963);
  P("Giorgio Chiellini", "", "DF", "it", "Juventus · EURO 2020", "e", 1984, 187);
  P("Leonardo Bonucci", "", "DF", "it", "Juventus · EURO 2020", "e", 1987, 190);
  P("Mats Hummels", "", "DF", "de", "Dortmund · 2014 Dünya Kupası", "e", 1988, 191);
  P("Jérôme Boateng", "", "DF", "de", "Bayern · 2014 Dünya Kupası", "e", 1988, 192);
  P("Vincent Kompany", "", "DF", "be", "Manchester City kaptanı", "e", 1986, 193);
  P("Fernando Hierro", "", "DF", "es", "Real Madrid", "e", 1968);
  P("Jamie Carragher", "", "DF", "gb-eng", "Liverpool", "e", 1978);
  P("Gary Neville", "", "DF", "gb-eng", "Manchester United", "e", 1975);
  P("Patrice Evra", "", "DF", "fr", "Manchester United", "e", 1981);
  P("Pepe", "Pepe (footballer, born 1983)", "DF", "pt", "Real Madrid · EURO 2016", "e", 1983);
  P("Bobby Moore", "", "DF", "gb-eng", "1966 Dünya Kupası kaptanı", "e", 1941);
  P("Daniel Passarella", "", "DF", "ar", "1978 Dünya Kupası kaptanı", "e", 1953);
  P("Bülent Korkmaz", "", "DF", "tr", "Galatasaray kaptanı", "t", 1968);
  P("Alpay Özalan", "", "DF", "tr", "2002 Dünya Kupası", "t", 1973);
  P("Ümit Davala", "", "DF", "tr", "2000 UEFA Kupası", "t", 1973);
  P("Ogün Temizkanoğlu", "", "DF", "tr", "Trabzonspor · Fenerbahçe", "t", 1969);
  P("Servet Çetin", "", "DF", "tr", "Galatasaray · EURO 2008", "t", 1981);
  P("Gökhan Gönül", "", "DF", "tr", "Fenerbahçe · Beşiktaş", "t", 1985);

  // Orta saha
  P("Diego Maradona", "", "OS", "ar", "1986 Dünya Kupası · Napoli", "e", 1960, 165);
  P("Zinedine Zidane", "", "OS", "fr", "1998 Dünya Kupası · Real Madrid", "e", 1972, 185);
  P("Ronaldinho", "", "OS", "br", "2005 Ballon d'Or · Barcelona", "e", 1980, 181);
  P("Kaká", "", "OS", "br", "2007 Ballon d'Or · Milan", "e", 1982, 186);
  P("Andrea Pirlo", "", "OS", "it", "Milan · Juventus", "e", 1979, 177);
  P("Xavi", "", "OS", "es", "Barcelona · tiki-taka", "e", 1980, 170);
  P("Andrés Iniesta", "", "OS", "es", "2010 final golü", "e", 1984, 171);
  P("Steven Gerrard", "", "OS", "gb-eng", "Liverpool kaptanı", "e", 1980, 183);
  P("Frank Lampard", "", "OS", "gb-eng", "Chelsea efsanesi", "e", 1978, 184);
  P("Paul Scholes", "", "OS", "gb-eng", "Manchester United", "e", 1974, 168);
  P("Patrick Vieira", "", "OS", "fr", "Arsenal 'Yenilmezler'", "e", 1976, 193);
  P("Clarence Seedorf", "", "OS", "nl", "3 kulüple Şampiyonlar Ligi", "e", 1976);
  P("David Beckham", "", "OS", "gb-eng", "Manchester United · Real Madrid", "e", 1975, 180);
  P("Luís Figo", "", "OS", "pt", "2000 Ballon d'Or", "e", 1972, 180);
  P("Rivaldo", "", "OS", "br", "1999 Ballon d'Or", "e", 1972);
  P("Toni Kroos", "", "OS", "de", "Real Madrid · 6× Şampiyonlar Ligi", "e", 1990, 183);
  P("Bastian Schweinsteiger", "", "OS", "de", "Bayern · 2014 Dünya Kupası", "e", 1984, 183);
  P("Michael Ballack", "", "OS", "de", "Leverkusen · Bayern · Chelsea", "e", 1976, 189);
  P("Lothar Matthäus", "", "OS", "de", "1990 Dünya Kupası kaptanı", "e", 1961);
  P("Michel Platini", "", "OS", "fr", "3× Ballon d'Or", "e", 1955);
  P("Ruud Gullit", "", "OS", "nl", "Milan · 1987 Ballon d'Or", "e", 1962);
  P("Frank Rijkaard", "", "OS", "nl", "Milan · Ajax", "e", 1962);
  P("Pavel Nedvěd", "", "OS", "cz", "Juventus · 2003 Ballon d'Or", "e", 1972);
  P("Gennaro Gattuso", "", "OS", "it", "Milan · 2006 Dünya Kupası", "e", 1978);
  P("Claude Makélélé", "", "OS", "fr", "Real Madrid · Chelsea", "e", 1973);
  P("Juan Román Riquelme", "", "OS", "ar", "Boca Juniors · Villarreal", "e", 1978);
  P("Juan Sebastián Verón", "", "OS", "ar", "Lazio · Manchester United", "e", 1975);
  P("Xabi Alonso", "", "OS", "es", "Liverpool · Real Madrid", "e", 1981, 183);
  P("Sergio Busquets", "", "OS", "es", "Barcelona", "e", 1988, 189);
  P("Cesc Fàbregas", "", "OS", "es", "Arsenal · Barcelona", "e", 1987);
  P("David Silva", "", "OS", "es", "Manchester City", "e", 1986, 170);
  P("Wesley Sneijder", "", "OS", "nl", "Inter treble · Galatasaray", "et", 1984, 170);
  P("Mesut Özil", "", "OS", "de", "Real Madrid · Arsenal · Fenerbahçe", "et", 1988, 180);
  P("Yaya Touré", "", "OS", "ci", "Barcelona · Manchester City", "e", 1983, 191);
  P("Michael Essien", "", "OS", "gh", "Chelsea", "e", 1982);
  P("Deco", "", "OS", "pt", "Porto · Barcelona", "e", 1977);
  P("Sócrates", "Sócrates (footballer)", "OS", "br", "1982 Brezilya'sı", "e", 1954);
  P("Zico", "Zico (footballer)", "OS", "br", "Beyaz Pelé", "e", 1953);
  P("Bobby Charlton", "", "OS", "gb-eng", "1966 Dünya Kupası", "e", 1937);
  P("Juninho Pernambucano", "", "OS", "br", "Frikik ustası · Lyon", "e", 1975);
  P("N'Golo Kanté", "", "OS", "fr", "Leicester · Chelsea · 2018 Dünya Kupası", "e", 1991, 168);
  P("Paul Pogba", "", "OS", "fr", "Juventus · 2018 Dünya Kupası", "e", 1993, 191);
  P("İlkay Gündoğan", "", "OS", "de", "Dortmund · Manchester City · Galatasaray", "et", 1990);
  P("Mario Götze", "", "OS", "de", "2014 Dünya Kupası final golü", "e", 1992);
  P("Gheorghe Hagi", "", "OS", "ro", "Galatasaray · Karpatların Maradonası", "et", 1965, 174);
  P("Alex de Souza", "", "OS", "br", "Fenerbahçe'nin 10 numarası", "et", 1977);
  P("Emre Belözoğlu", "", "OS", "tr", "Galatasaray · Inter · Fenerbahçe", "t", 1980, 170);
  P("Arda Turan", "", "OS", "tr", "Galatasaray · Atlético · Barcelona", "t", 1987, 175);
  P("Tugay Kerimoğlu", "", "OS", "tr", "Galatasaray · Blackburn", "t", 1970);
  P("Sergen Yalçın", "", "OS", "tr", "Beşiktaş'ın yeteneği", "t", 1972);
  P("Rıdvan Dilmen", "", "OS", "tr", "Fenerbahçe", "t", 1962);
  P("Hasan Şaş", "", "OS", "tr", "2002 Dünya Kupası", "t", 1976);
  P("Okan Buruk", "", "OS", "tr", "Galatasaray · 2000 UEFA Kupası", "t", 1973);
  P("Yıldıray Baştürk", "", "OS", "tr", "Leverkusen · 2002 Dünya Kupası", "t", 1978);
  P("Selçuk İnan", "", "OS", "tr", "Galatasaray kaptanı", "t", 1985);
  P("Mehmet Topal", "", "OS", "tr", "Galatasaray · Fenerbahçe", "t", 1986);
  P("Felipe Melo", "", "OS", "br", "Juventus · Galatasaray", "t", 1983);

  // Forvet
  P("Pelé", "", "FV", "br", "3× Dünya Kupası", "e", 1940, 173);
  P("Johan Cruyff", "", "FV", "nl", "Total Futbol · 3× Ballon d'Or", "e", 1947);
  P("Ronaldo Nazário", "Ronaldo (Brazilian footballer)", "FV", "br", "Fenomen · 2× Dünya Kupası", "e", 1976, 183);
  P("Thierry Henry", "", "FV", "fr", "Arsenal efsanesi", "e", 1977, 188);
  P("Francesco Totti", "", "FV", "it", "Roma'nın kralı", "e", 1976, 180);
  P("Alessandro Del Piero", "", "FV", "it", "Juventus", "e", 1974);
  P("Andriy Shevchenko", "", "FV", "ua", "2004 Ballon d'Or", "e", 1976);
  P("Zlatan Ibrahimović", "", "FV", "se", "Ajax · Juventus · Barça · Milan · PSG", "e", 1981, 195);
  P("Didier Drogba", "", "FV", "ci", "Chelsea · Galatasaray", "et", 1978, 188);
  P("Samuel Eto'o", "", "FV", "cm", "2 farklı kulüple treble", "e", 1981);
  P("Wayne Rooney", "", "FV", "gb-eng", "Manchester United rekortmeni", "e", 1985, 176);
  P("Eric Cantona", "", "FV", "fr", "King Eric", "e", 1966);
  P("Marco van Basten", "", "FV", "nl", "3× Ballon d'Or", "e", 1964);
  P("Ruud van Nistelrooy", "", "FV", "nl", "Manchester United · Real Madrid", "e", 1976);
  P("Raúl", "Raúl (footballer)", "FV", "es", "Real Madrid efsanesi", "e", 1977);
  P("George Weah", "", "FV", "lr", "1995 Ballon d'Or", "e", 1966);
  P("Karim Benzema", "", "FV", "fr", "2022 Ballon d'Or", "e", 1987, 185);
  P("Luis Suárez", "", "FV", "uy", "Liverpool · Barcelona", "e", 1987, 182);
  P("Sergio Agüero", "", "FV", "ar", "Manchester City · 93:20", "e", 1988, 173);
  P("Arjen Robben", "", "FV", "nl", "Bayern Münih", "e", 1984);
  P("Franck Ribéry", "", "FV", "fr", "Bayern Münih", "e", 1983);
  P("Gareth Bale", "", "FV", "gb-wls", "Real Madrid · 5× Şampiyonlar Ligi", "e", 1989, 185);
  P("Eden Hazard", "", "FV", "be", "Chelsea", "e", 1991, 175);
  P("Ángel Di María", "", "FV", "ar", "Real Madrid · 2022 Dünya Kupası", "e", 1988);
  P("Gerd Müller", "", "FV", "de", "Der Bomber", "e", 1945);
  P("Eusébio", "", "FV", "pt", "Benfica · Kara Panter", "e", 1942);
  P("Alfredo Di Stéfano", "", "FV", "es", "Real Madrid · 5 Avrupa Kupası", "e", 1926);
  P("Ferenc Puskás", "", "FV", "hu", "Real Madrid · Macar efsanesi", "e", 1927);
  P("Romário", "", "FV", "br", "1994 Dünya Kupası", "e", 1966);
  P("Hristo Stoichkov", "", "FV", "bg", "1994 Ballon d'Or", "e", 1966);
  P("Gabriel Batistuta", "", "FV", "ar", "Batigol · Fiorentina", "e", 1969);
  P("Hernán Crespo", "", "FV", "ar", "Parma · Lazio · Chelsea", "e", 1975);
  P("Fernando Torres", "", "FV", "es", "Liverpool · EURO 2008 final golü", "e", 1984, 186);
  P("David Villa", "", "FV", "es", "İspanya'nın en golcüsü", "e", 1981);
  P("Robin van Persie", "", "FV", "nl", "Arsenal · Man United · Fenerbahçe", "et", 1983);
  P("Michael Owen", "", "FV", "gb-eng", "2001 Ballon d'Or", "e", 1979);
  P("Alan Shearer", "", "FV", "gb-eng", "Premier Lig rekortmeni", "e", 1970);
  P("Miroslav Klose", "", "FV", "de", "Dünya Kupası rekortmeni", "e", 1978);
  P("Filippo Inzaghi", "", "FV", "it", "Milan", "e", 1973);
  P("Christian Vieri", "", "FV", "it", "Inter", "e", 1973);
  P("Paolo Rossi", "", "FV", "it", "1982 Dünya Kupası gol kralı", "e", 1956);
  P("Roberto Baggio", "", "FV", "it", "1993 Ballon d'Or", "e", 1967);
  P("Diego Forlán", "", "FV", "uy", "2010 Dünya Kupası'nın en iyisi", "e", 1979);
  P("Edinson Cavani", "", "FV", "uy", "Napoli · PSG", "e", 1987);
  P("Carlos Tevez", "", "FV", "ar", "Man United · Man City · Juventus", "e", 1984);
  P("Radamel Falcao", "", "FV", "co", "Atlético · Galatasaray", "et", 1986);
  P("Antoine Griezmann", "", "FV", "fr", "Atlético · 2018 Dünya Kupası", "ey", 1991, 176);
  P("Thomas Müller", "", "FV", "de", "Bayern Münih", "e", 1989, 185);
  P("Mario Mandžukić", "", "FV", "hr", "Bayern · Juventus", "e", 1986);
  P("Dimitar Berbatov", "", "FV", "bg", "Manchester United", "e", 1981);
  P("Peter Crouch", "", "FV", "gb-eng", "Liverpool · Stoke", "e", 1981, 201);
  P("Jamie Vardy", "", "FV", "gb-eng", "Leicester mucizesi", "e", 1987);
  P("Nicolas Anelka", "", "FV", "fr", "Chelsea · Fenerbahçe", "et", 1979);
  P("Dirk Kuyt", "", "FV", "nl", "Liverpool · Fenerbahçe", "et", 1980);
  P("Mario Gómez", "", "FV", "de", "Bayern · Beşiktaş", "et", 1985);
  P("Ricardo Quaresma", "", "FV", "pt", "Trivela · Beşiktaş", "et", 1983);
  P("Pierre van Hooijdonk", "", "FV", "nl", "Fenerbahçe", "t", 1969);
  P("Mário Jardel", "", "FV", "br", "Porto · Galatasaray", "t", 1973);
  P("Moussa Sow", "", "FV", "sn", "Fenerbahçe röveşatası", "t", 1986);
  P("Bafétimbi Gomis", "", "FV", "fr", "Galatasaray gol kralı", "t", 1985);
  P("Vincent Aboubakar", "", "FV", "cm", "Beşiktaş", "t", 1992);
  P("Tanju Çolak", "", "FV", "tr", "1988 Avrupa Altın Ayakkabı", "t", 1963);
  P("Metin Oktay", "", "FV", "tr", "Taçsız Kral", "et", 1936);
  P("Lefter Küçükandonyadis", "", "FV", "tr", "Ordinaryüs", "et", 1925);
  P("Nihat Kahveci", "", "FV", "tr", "Real Sociedad · Villarreal", "t", 1979);
  P("Tuncay Şanlı", "", "FV", "tr", "Fenerbahçe · EURO 2008", "t", 1982);
  P("Burak Yılmaz", "", "FV", "tr", "Kral · Lille şampiyonluğu", "t", 1985);
  P("Hami Mandıralı", "", "FV", "tr", "Trabzonspor", "t", 1968);
  P("Aykut Kocaman", "", "FV", "tr", "Fenerbahçe", "t", 1965);
  P("Feyyaz Uçar", "", "FV", "tr", "Beşiktaş", "t", 1963);
  P("Semih Şentürk", "", "FV", "tr", "Fenerbahçe · EURO 2008", "t", 1983);
  P("Arif Erdem", "", "FV", "tr", "Galatasaray · 2000 UEFA Kupası", "t", 1972);
  P("İlhan Mansız", "", "FV", "tr", "2002 altın golü", "t", 1975);

  /* ================= GÜNÜMÜZ YILDIZLARI ================= */
  // Kaleciler
  P("Thibaut Courtois", "", "KL", "be", "Real Madrid", "y", 1992, 200);
  P("Alisson Becker", "", "KL", "br", "Liverpool", "y", 1992, 191);
  P("Ederson", "Ederson (footballer, born 1993)", "KL", "br", "Manchester City", "y", 1993, 188);
  P("Gianluigi Donnarumma", "", "KL", "it", "EURO 2020 turnuvanın oyuncusu", "y", 1999, 196);
  P("Emiliano Martínez", "", "KL", "ar", "2022 Dünya Kupası Altın Eldiven", "y", 1992);
  P("Manuel Neuer", "", "KL", "de", "Bayern · 2014 Dünya Kupası", "ye", 1986, 193);
  P("Marc-André ter Stegen", "", "KL", "de", "Barcelona", "y", 1992);
  P("Jan Oblak", "", "KL", "si", "Atlético Madrid", "y", 1993);
  P("Mike Maignan", "", "KL", "fr", "Milan", "y", 1995);
  P("André Onana", "", "KL", "cm", "Inter · Man United", "y", 1996);
  P("David Raya", "", "KL", "es", "Arsenal", "y", 1995);
  P("Yassine Bounou", "", "KL", "ma", "Sevilla · 2022 Dünya Kupası", "y", 1991);
  P("Gregor Kobel", "", "KL", "ch", "Dortmund", "y", 1997);
  P("Diogo Costa", "", "KL", "pt", "Porto", "y", 1999);
  P("Unai Simón", "", "KL", "es", "Athletic Bilbao · EURO 2024", "y", 1997);
  P("Jordan Pickford", "", "KL", "gb-eng", "Everton", "y", 1994);
  P("Dominik Livaković", "", "KL", "hr", "Hırvatistan · Fenerbahçe", "yt", 1995);
  P("Uğurcan Çakır", "", "KL", "tr", "A Milli Takım", "t", 1996);
  P("Mert Günok", "", "KL", "tr", "EURO 2024 kurtarışı", "t", 1989);
  P("Altay Bayındır", "", "KL", "tr", "Fenerbahçe · Man United", "t", 1998);

  // Defans
  P("Virgil van Dijk", "", "DF", "nl", "Liverpool kaptanı", "y", 1991, 193);
  P("Achraf Hakimi", "", "DF", "ma", "PSG", "y", 1998);
  P("Antonio Rüdiger", "", "DF", "de", "Real Madrid", "y", 1993);
  P("William Saliba", "", "DF", "fr", "Arsenal", "y", 2001);
  P("Joško Gvardiol", "", "DF", "hr", "Manchester City", "y", 2002);
  P("Trent Alexander-Arnold", "", "DF", "gb-eng", "Liverpool · Real Madrid", "y", 1998);
  P("Nuno Mendes", "Nuno Mendes (footballer, born 2002)", "DF", "pt", "PSG", "y", 2002);
  P("Rúben Dias", "", "DF", "pt", "Manchester City", "y", 1997);
  P("Marquinhos", "", "DF", "br", "PSG kaptanı", "y", 1994);
  P("Alessandro Bastoni", "", "DF", "it", "Inter", "y", 1999);
  P("Theo Hernández", "", "DF", "fr", "Milan", "y", 1997);
  P("João Cancelo", "", "DF", "pt", "Manchester City · Barcelona", "y", 1994);
  P("Kyle Walker", "", "DF", "gb-eng", "Manchester City", "y", 1990);
  P("Alphonso Davies", "", "DF", "ca", "Bayern Münih", "y", 2000);
  P("Kim Min-jae", "", "DF", "kr", "Fenerbahçe · Napoli · Bayern", "yt", 1996);
  P("Jules Koundé", "", "DF", "fr", "Barcelona", "y", 1998);
  P("Ronald Araújo", "", "DF", "uy", "Barcelona", "y", 1999);
  P("Éder Militão", "", "DF", "br", "Real Madrid", "y", 1998);
  P("Dani Carvajal", "", "DF", "es", "Real Madrid", "y", 1992);
  P("Andrew Robertson", "", "DF", "gb-sct", "Liverpool", "y", 1994);
  P("Gabriel Magalhães", "", "DF", "br", "Arsenal", "y", 1997);
  P("Pau Cubarsí", "", "DF", "es", "Barcelona", "y", 2007);
  P("Dean Huijsen", "", "DF", "es", "Real Madrid", "y", 2005);
  P("Aymeric Laporte", "", "DF", "es", "Manchester City · EURO 2024", "y", 1994);
  P("Federico Dimarco", "", "DF", "it", "Inter", "y", 1997);
  P("Jeremie Frimpong", "", "DF", "nl", "Leverkusen · Liverpool", "y", 2000);
  P("Milan Škriniar", "", "DF", "sk", "Inter · PSG · Fenerbahçe", "yt", 1995);
  P("Davinson Sánchez", "", "DF", "co", "Galatasaray", "t", 1996);
  P("Ferdi Kadıoğlu", "", "DF", "tr", "Fenerbahçe · Brighton", "t", 1999);
  P("Merih Demiral", "", "DF", "tr", "EURO 2024 · 2 gol", "t", 1998);
  P("Abdülkerim Bardakcı", "", "DF", "tr", "Galatasaray", "t", 1994);
  P("Çağlar Söyüncü", "", "DF", "tr", "Leicester · Fenerbahçe", "t", 1996);
  P("Zeki Çelik", "", "DF", "tr", "Lille · Roma", "t", 1997);
  P("Kaan Ayhan", "", "DF", "tr", "Galatasaray", "t", 1994);

  // Orta saha
  P("Jude Bellingham", "", "OS", "gb-eng", "Real Madrid", "y", 2003, 186);
  P("Kevin De Bruyne", "", "OS", "be", "Asist ustası", "y", 1991, 181);
  P("Luka Modrić", "", "OS", "hr", "2018 Ballon d'Or", "ye", 1985, 172);
  P("Rodri", "Rodri (footballer, born 1996)", "OS", "es", "2024 Ballon d'Or", "y", 1996, 191);
  P("Pedri", "", "OS", "es", "Barcelona", "y", 2002, 174);
  P("Florian Wirtz", "", "OS", "de", "Leverkusen'in namağlup şampiyonluğu", "y", 2003);
  P("Jamal Musiala", "", "OS", "de", "Bayern Münih", "y", 2003);
  P("Cole Palmer", "", "OS", "gb-eng", "Chelsea", "y", 2002);
  P("Federico Valverde", "", "OS", "uy", "Real Madrid", "y", 1998);
  P("Declan Rice", "", "OS", "gb-eng", "Arsenal", "y", 1999);
  P("Joshua Kimmich", "", "OS", "de", "Bayern Münih", "y", 1995);
  P("Bruno Fernandes", "", "OS", "pt", "Manchester United kaptanı", "y", 1994);
  P("Martin Ødegaard", "", "OS", "no", "Arsenal kaptanı", "y", 1998);
  P("Vitinha", "Vitinha (footballer, born February 2000)", "OS", "pt", "PSG", "y", 2000);
  P("Bernardo Silva", "", "OS", "pt", "Manchester City", "y", 1994);
  P("Phil Foden", "", "OS", "gb-eng", "Manchester City", "y", 2000, 171);
  P("Alexis Mac Allister", "", "OS", "ar", "Liverpool · 2022 Dünya Kupası", "y", 1998);
  P("Enzo Fernández", "", "OS", "ar", "Chelsea · 2022 Dünya Kupası", "y", 2001);
  P("Frenkie de Jong", "", "OS", "nl", "Ajax · Barcelona", "y", 1997);
  P("Gavi", "Gavi (footballer)", "OS", "es", "Barcelona", "y", 2004);
  P("Aurélien Tchouaméni", "", "OS", "fr", "Real Madrid", "y", 2000);
  P("Eduardo Camavinga", "", "OS", "fr", "Real Madrid", "y", 2002);
  P("Nicolò Barella", "", "OS", "it", "Inter", "y", 1997);
  P("Dominik Szoboszlai", "", "OS", "hu", "Liverpool", "y", 2000);
  P("Martín Zubimendi", "", "OS", "es", "Real Sociedad · Arsenal", "y", 1999);
  P("João Neves", "", "OS", "pt", "Benfica · PSG", "y", 2004);
  P("Moisés Caicedo", "", "OS", "ec", "Chelsea", "y", 2001);
  P("Bruno Guimarães", "", "OS", "br", "Newcastle", "y", 1997);
  P("Lucas Paquetá", "", "OS", "br", "West Ham", "y", 1997);
  P("Sandro Tonali", "", "OS", "it", "Milan · Newcastle", "y", 2000);
  P("Fabián Ruiz", "", "OS", "es", "PSG · EURO 2024", "y", 1996);
  P("Dani Olmo", "", "OS", "es", "Barcelona · EURO 2024", "y", 1998);
  P("James Rodríguez", "", "OS", "co", "2014 Dünya Kupası gol kralı", "ye", 1991);
  P("Hakim Ziyech", "", "OS", "ma", "Ajax · Chelsea · Galatasaray", "yt", 1993);
  P("Lucas Torreira", "", "OS", "uy", "Galatasaray", "t", 1996);
  P("Fred", "Fred (footballer, born 1993)", "OS", "br", "Man United · Fenerbahçe", "t", 1993);
  P("Sebastian Szymański", "", "OS", "pl", "Fenerbahçe", "t", 1999);
  P("Hakan Çalhanoğlu", "", "OS", "tr", "Inter · Milli takım kaptanı", "ty", 1994, 178);
  P("Arda Güler", "", "OS", "tr", "Real Madrid", "ty", 2005, 176);
  P("Orkun Kökçü", "", "OS", "tr", "Feyenoord · Benfica", "t", 2000);
  P("İsmail Yüksek", "", "OS", "tr", "Fenerbahçe", "t", 1999);
  P("Salih Özcan", "", "OS", "tr", "Dortmund", "t", 1998);
  P("İrfan Can Kahveci", "", "OS", "tr", "Başakşehir · Fenerbahçe", "t", 1995);
  P("Yusuf Yazıcı", "", "OS", "tr", "Trabzonspor · Lille", "t", 1997);

  // Forvet
  P("Lionel Messi", "", "FV", "ar", "8× Ballon d'Or · 2022 Dünya Kupası", "ye", 1987, 170);
  P("Cristiano Ronaldo", "", "FV", "pt", "5× Ballon d'Or", "ye", 1985, 187);
  P("Kylian Mbappé", "", "FV", "fr", "2018 Dünya Kupası", "y", 1998, 178);
  P("Erling Haaland", "", "FV", "no", "Gol makinesi", "y", 2000, 195);
  P("Vinícius Júnior", "", "FV", "br", "Real Madrid", "y", 2000, 176);
  P("Lamine Yamal", "", "FV", "es", "EURO 2024 şampiyonu", "y", 2007);
  P("Mohamed Salah", "", "FV", "eg", "Liverpool", "y", 1992, 175);
  P("Harry Kane", "", "FV", "gb-eng", "Tottenham · Bayern", "y", 1993, 188);
  P("Robert Lewandowski", "", "FV", "pl", "Bundesliga rekortmeni", "y", 1988, 185);
  P("Neymar", "", "FV", "br", "Brezilya'nın en golcüsü", "y", 1992, 175);
  P("Lautaro Martínez", "", "FV", "ar", "Inter kaptanı", "y", 1997);
  P("Ousmane Dembélé", "", "FV", "fr", "2025 Ballon d'Or · PSG", "y", 1997);
  P("Raphinha", "", "FV", "br", "Barcelona", "y", 1996);
  P("Bukayo Saka", "", "FV", "gb-eng", "Arsenal", "y", 2001);
  P("Khvicha Kvaratskhelia", "", "FV", "ge", "Kvaradona", "y", 2001);
  P("Son Heung-min", "", "FV", "kr", "Tottenham efsanesi", "y", 1992);
  P("Victor Osimhen", "", "FV", "ng", "Napoli · Galatasaray", "yt", 1998);
  P("Julián Álvarez", "", "FV", "ar", "Man City · Atlético", "y", 2000);
  P("Rafael Leão", "", "FV", "pt", "Milan", "y", 1999);
  P("Marcus Rashford", "", "FV", "gb-eng", "Manchester United", "y", 1997);
  P("Rodrygo", "", "FV", "br", "Real Madrid", "y", 2001);
  P("Leroy Sané", "", "FV", "de", "Man City · Bayern · Galatasaray", "yt", 1996);
  P("Kingsley Coman", "", "FV", "fr", "Bayern Münih", "y", 1996);
  P("Nico Williams", "", "FV", "es", "Athletic Bilbao · EURO 2024", "y", 2002);
  P("Alexander Isak", "", "FV", "se", "Newcastle · Liverpool", "y", 1999);
  P("Viktor Gyökeres", "", "FV", "se", "Sporting · Arsenal", "y", 1998);
  P("Darwin Núñez", "", "FV", "uy", "Benfica · Liverpool", "y", 1999);
  P("Luis Díaz", "Luis Díaz (Colombian footballer)", "FV", "co", "Liverpool · Bayern", "y", 1997);
  P("Cody Gakpo", "", "FV", "nl", "PSV · Liverpool", "y", 1999);
  P("Dušan Vlahović", "", "FV", "rs", "Juventus", "y", 2000);
  P("Romelu Lukaku", "", "FV", "be", "Belçika'nın en golcüsü", "y", 1993, 191);
  P("Ollie Watkins", "", "FV", "gb-eng", "Aston Villa", "y", 1995);
  P("Jonathan David", "", "FV", "ca", "Lille · Juventus", "y", 2000);
  P("Serhou Guirassy", "", "FV", "gn", "Stuttgart · Dortmund", "y", 1996);
  P("Michael Olise", "", "FV", "fr", "Bayern Münih", "y", 2001);
  P("Désiré Doué", "", "FV", "fr", "PSG", "y", 2005);
  P("Bradley Barcola", "", "FV", "fr", "PSG", "y", 2002);
  P("Paulo Dybala", "", "FV", "ar", "Juventus · Roma", "y", 1993);
  P("Christopher Nkunku", "", "FV", "fr", "Leipzig · Chelsea", "y", 1997);
  P("Gabriel Jesus", "", "FV", "br", "Man City · Arsenal", "y", 1997);
  P("Kai Havertz", "", "FV", "de", "2021 Şampiyonlar Ligi final golü", "y", 1999);
  P("Federico Chiesa", "", "FV", "it", "Juventus · EURO 2020", "y", 1997);
  P("Riyad Mahrez", "", "FV", "dz", "Leicester · Manchester City", "ye", 1991);
  P("Sadio Mané", "", "FV", "sn", "Liverpool", "ye", 1992);
  P("Pierre-Emerick Aubameyang", "", "FV", "ga", "Dortmund · Arsenal", "ye", 1989);
  P("Mohammed Kudus", "", "FV", "gh", "Ajax · West Ham", "y", 2000);
  P("Bryan Mbeumo", "", "FV", "cm", "Brentford · Man United", "y", 1999);
  P("Xavi Simons", "", "FV", "nl", "PSV · Leipzig", "y", 2003);
  P("Benjamin Šeško", "", "FV", "si", "Leipzig · Man United", "y", 2003);
  P("Hugo Ekitiké", "", "FV", "fr", "Frankfurt · Liverpool", "y", 2002);
  P("Ademola Lookman", "", "FV", "ng", "2024 UEFA Avrupa Ligi finali hat-trick", "y", 1997);
  P("Ciro Immobile", "", "FV", "it", "Lazio rekortmeni · Beşiktaş", "yt", 1990);
  P("Edin Džeko", "", "FV", "ba", "City · Roma · Inter · Fenerbahçe", "et", 1986, 193);
  P("Mauro Icardi", "", "FV", "ar", "Inter · Galatasaray gol kralı", "t", 1993, 181);
  P("Dries Mertens", "", "FV", "be", "Napoli rekortmeni · Galatasaray", "t", 1987, 169);
  P("Youssef En-Nesyri", "", "FV", "ma", "Sevilla · Fenerbahçe", "t", 1997);
  P("Alexander Sørloth", "", "FV", "no", "Trabzonspor gol kralı", "t", 1995);
  P("Enner Valencia", "", "FV", "ec", "Fenerbahçe gol kralı", "t", 1989);
  P("Kenan Yıldız", "", "FV", "tr", "Juventus'un 10 numarası", "ty", 2005);
  P("Kerem Aktürkoğlu", "", "FV", "tr", "Galatasaray · Benfica", "t", 1998);
  P("Barış Alper Yılmaz", "", "FV", "tr", "Galatasaray", "t", 2000);
  P("Cenk Tosun", "", "FV", "tr", "Beşiktaş · Everton", "t", 1991);

  window.FOOTBALLERS = L;
})();

window.POSITIONS = { KL: "Kaleci", DF: "Defans", OS: "Orta Saha", FV: "Forvet" };

window.COUNTRIES = {
  br: "Brezilya", ar: "Arjantin", nl: "Hollanda", de: "Almanya", fr: "Fransa", it: "İtalya",
  es: "İspanya", "gb-eng": "İngiltere", dk: "Danimarka", pt: "Portekiz", ua: "Ukrayna", se: "İsveç",
  ci: "Fildişi Sahili", cm: "Kamerun", lr: "Liberya", uy: "Uruguay", "gb-wls": "Galler", no: "Norveç",
  eg: "Mısır", pl: "Polonya", kr: "Güney Kore", ge: "Gürcistan", be: "Belçika", hr: "Hırvatistan",
  ma: "Fas", tr: "Türkiye", ro: "Romanya", ng: "Nijerya", ba: "Bosna-Hersek", cz: "Çekya",
  rs: "Sırbistan", gh: "Gana", hu: "Macaristan", bg: "Bulgaristan", co: "Kolombiya", si: "Slovenya",
  ch: "İsviçre", ca: "Kanada", "gb-sct": "İskoçya", sk: "Slovakya", ec: "Ekvador", gn: "Gine",
  dz: "Cezayir", sn: "Senegal", ga: "Gabon",
};
